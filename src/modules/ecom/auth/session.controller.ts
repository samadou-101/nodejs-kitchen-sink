import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "@/modules/ecom/shared/response";

export async function sessionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth) {
      sendError(res, 401, "UNAUTHORIZED", "Not authenticated");
      return;
    }
    sendSuccess(res, req.auth);
  } catch (error) {
    next(error);
  }
}
