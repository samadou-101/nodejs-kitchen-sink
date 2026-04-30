import type { Request, Response } from "express";
import {
  confirmPasswordReset,
  loginUserJWT,
  refreshTokensJWT,
  regsiterUserJWT,
  sendPasswordResetToken,
} from "./jwt.service";

export async function passwordAuthHandler(req: Request, res: Response) {
  if (
    req.path === "/auth/password/register?type=jwt" &&
    req.method === "POST"
  ) {
    await regsiterUserJWT(req, res);
    return;
  }
  if (req.path === "/auth/password/login?type=jwt" && req.method === "POST") {
    console.log("passing login");
    await loginUserJWT(req, res);
    return;
  }
  if (req.path === "/auth/password/refresh?type=jwt" && req.method === "POST") {
    await refreshTokensJWT(req, res);
    return;
  }
  if (req.path === "/auth/password/reset" && req.method === "POST") {
    sendPasswordResetToken(req, res);
    return;
  }
  if (req.path === "/auth/password/new" && req.method === "POST") {
    await confirmPasswordReset(req, res);
    return;
  }
}
