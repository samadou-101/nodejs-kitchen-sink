import type { Request, Response } from "express";
import { initiateGoogleAuth, handleGoogleCallback } from "./oauth.service";

export async function oauthHandler(req: Request, res: Response) {
  if (req.path === "/auth/oauth/google/url" && req.method === "GET") {
    const url = await initiateGoogleAuth();
    res.json({ url });
    return;
  }

  if (req.path === "/auth/oauth/google/callback" && req.method === "GET") {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.redirect("http://localhost:5173/oauth/success?error=missing_code");
      return;
    }

    try {
      const token = await handleGoogleCallback(code);
      res.redirect(`http://localhost:5173/oauth/success?token=${token}`);
    } catch {
      res.redirect("http://localhost:5173/oauth/success?error=authentication_failed");
    }
    return;
  }

  res.status(404).json({ message: "Not found" });
}
