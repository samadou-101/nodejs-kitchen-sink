import type { Request, Response } from "express";
import { generateTokens, hashPassword, verifyPassword } from "../auth.utils";
import { prisma } from "@/config/db.config";
import { Prisma } from "@/generated/prisma/client";

export async function passwordAuthHandler(req: Request, res: Response) {
  if (req.path === "/auth/password/register" && req.method === "POST") {
    regsiterUser(req, res);
  }
  if (req.path === "/auth/password/login" && req.method === "POST") {
    loginUser(req, res);
  }
}

async function regsiterUser(req: Request, res: Response) {
  const { name, email, password } = req.body;
  console.log(req.cookies);

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
      path: "/api/auth/refresh",
    });
    res.status(201).send({ name: user.name, email: user.email });
    return;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.send("User Already Exists (evne if it is bad for security)");
        return;
      }
      res.send(error);
    }
  }
}

async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const accessToken = req.cookies.rt;
  console.log(accessToken);

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
      path: "/api/auth/refresh",
    });
    res
      .status(200)
      .send({ name: existingUser.name, email: existingUser.email });
  } catch (error) {}
}
