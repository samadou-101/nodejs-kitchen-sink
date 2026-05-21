import type { Request, Response, NextFunction } from "express";
import { revokeSession } from "@/modules/ecom/auth/session/session.service";
import { sendSuccess } from "@/modules/ecom/shared/response";

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sid = req.cookies.sid ?? null;
    if (sid) {
      await revokeSession(sid);
    }
    res.clearCookie("sid");
    sendSuccess(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}
