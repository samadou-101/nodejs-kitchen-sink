import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  generatePasswordResetToken,
  generateTokens,
  hashPassword,
  verifyPassword,
} from "../auth.utils";
import { prisma } from "@/config/db.config";
import { Prisma } from "@/generated/prisma/client";
import * as argon2 from "argon2";
import type { SessionData } from "./auth.types";
import { redisClient } from "@/config/redis.config";

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

export async function regsiterUserJWT(req: Request, res: Response) {
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

export async function loginUserJWT(req: Request, res: Response) {
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

export async function refreshTokensJWT(req: Request, res: Response) {
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

export async function sendPasswordResetToken(req: Request, res: Response) {
  const { email } = req.body ?? {};
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const { rawToken, hashedToken } = await generatePasswordResetToken();
  const passwordResetURL = `http://localhost:3000/api/auth/password/reset?confim=${rawToken}`;
  try {
    const userData = await prisma.user.findUnique({
      where: { email },
    });
    if (!userData) {
      res.status(500).send("Something Went Wrong!");
      return;
    }
    await prisma.passwodResetTokens.create({
      data: {
        token_hash: hashedToken,
        userId: userData.id,
        expires_at: new Date(Date.now() + 60 * 1000),
      },
    });
    res.status(200).json({
      resetURL: passwordResetURL,
      token: rawToken,
      newPassword: {
        url: "http://localhost:3000/api/auth/password/new",
        body: {
          resetToken: "the reset token you received from the reset url",
          email: "your email",
          newPassword: "your new password",
        },
      },
    });
    return;
  } catch (error) {}
  res.status(500).json("Something Went Wrong!");
  return;
}

export async function confirmPasswordReset(req: Request, res: Response) {
  const { email, resetToken, newPassword } = req.body ?? {};
  console.log(resetToken + " " + email + " " + newPassword);
  try {
    const userData = await prisma.user.findUnique({
      where: { email },
    });

    if (!userData) {
      res.status(409).send("invalid Credentials");
      return;
    }

    const tokenResetData = await prisma.passwodResetTokens.findFirst({
      where: { userId: userData.id, used_at: null },
    });

    if (!tokenResetData) {
      console.log("hit, no token");
      res.status(401).send("Unaothorized");
      return;
    }

    const validTokenHash = await argon2.verify(
      tokenResetData?.token_hash,
      resetToken,
    );

    if (!validTokenHash) {
      console.log("hit, token not valid");
      res.status(401).send("Unaothorized");
      return;
    }
    if (tokenResetData.expires_at < new Date()) {
      console.log("reset token expired");
      res.status(401).send("Token Expired");
      return;
    }
    const newHashedPassword = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { email },
      data: { password: newHashedPassword },
    });
    await prisma.passwodResetTokens.update({
      where: {
        id: tokenResetData.id,
      },
      data: { used_at: new Date(Date.now()) },
    });
    res.status(201).send("Your password is updated successfully!");
    return;
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}
