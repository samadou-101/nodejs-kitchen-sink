import type { Request, Response } from "express";
import passport from "passport";
import { handleGoogleCallback } from "./passport.service";
import "./passport.setup";

export function passportAuthHandler(req: Request, res: Response) {
  if (req.path === "/auth/oauth/passport/google/url") {
    passport.authenticate("google", {
      scope: ["openid", "email", "profile"],
      session: false,
    })(req, res);
    return;
  }

  if (req.path === "/auth/oauth/passport/google/callback") {
    passport.authenticate("google", { session: false }, (err: unknown, profile: unknown) => {
      if (err || !profile) {
        res.redirect("http://localhost:5173/oauth/success?error=authentication_failed");
        return;
      }

      handleGoogleCallback(profile as any)
        .then((token) => {
          res.redirect(`http://localhost:5173/oauth/success?token=${token}`);
        })
        .catch(() => {
          res.redirect("http://localhost:5173/oauth/success?error=authentication_failed");
        });
    })(req, res);
    return;
  }

  res.status(404).json({ message: "Not found" });
}
