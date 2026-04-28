import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateTokens, hashPassword, verifyPassword } from "../auth.utils";
import { prisma } from "@/config/db.config";
import { Prisma } from "@/generated/prisma/client";

export async function passwordAuthHandler(req: Request, res: Response) {
  if (req.path === "/auth/password/register" && req.method === "POST") {
    await regsiterUser(req, res);
    return;
  }
  if (req.path === "/auth/password/login" && req.method === "POST") {
    console.log("passing login");
    await loginUser(req, res);
    return;
  }
  if (req.path === "/auth/password/refresh" && req.method === "POST") {
    await refreshTokens(req, res);
    return;
  }
}
export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accessToken = req.cookies.at;
  try {
    const verifiedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    console.log("access token verfication + ", verifiedAccessToken);
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
    return;
  }
}

async function regsiterUser(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = await generateTokens(user.id);
    res.cookie("at", accessToken, { maxAge: 15 * 60 * 1000 });
    res.cookie("rt", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/api/auth/password/refresh",
    });
    res.status(201).send({ name: user.name, email: user.email });
    console.log("checking register function");
    return;
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.send("User Already Exists (evne if it is bad for security)");
        return;
      }
      res.send(error.message);
    }
    res.status(500).send(error.message);
  }
}

async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      res.send(400).send("Already exists");
      return;
    }
    const isPasswordValid = await verifyPassword(
      password,
      existingUser?.password,
    );
    if (!isPasswordValid) {
      res.send(401).send("Invalid Credentials");
      return;
    }
    const { accessToken, refreshToken } = await generateTokens(existingUser.id);
    res.cookie("at", accessToken, { maxAge: 15 * 60 * 1000 });
    res.cookie("rt", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/api/auth/password/refresh",
    });
    res
      .status(200)
      .send({ name: existingUser.name, email: existingUser.email });
  } catch (error) {}
}

async function refreshTokens(req: Request, res: Response) {
  type TokenPayload = { userId: string };
  const refreshToken = req.cookies.rt;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  console.log(refreshToken);
  if (!refreshToken || !refreshTokenSecret) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const validRefreshToken = jwt.verify(
      refreshToken,
      refreshTokenSecret,
    ) as TokenPayload;
    const userId = validRefreshToken.userId;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(Number(userId));
    res.cookie("at", newAccessToken, { maxAge: 1000 * 60 * 15 });
    res.cookie("rt", newRefreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
    res.status(200).send("Tokens generated");
    return;
  } catch (error: any) {
    console.log(error.message);
    res.status(401).send("Unauthorized!");
  }
}
