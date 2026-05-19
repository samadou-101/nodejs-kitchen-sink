import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { AppError } from "./errors";
import { sendError } from "./response";
import { logger } from "./logger";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  if (err instanceof z.ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Validation failed", err.issues);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendError(res, 409, "CONFLICT", "Resource already exists");
      return;
    }
  }

  (req.log ?? logger).error({ err }, "Unhandled error");
  sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
}
