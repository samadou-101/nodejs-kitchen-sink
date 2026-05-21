import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { AppError } from "./errors";
import { sendError } from "./response";
import { logger } from "./logger";

function unwrapError(err: Error): Error {
  let current: unknown = err;
  while (current instanceof Error && current.cause instanceof Error) {
    current = current.cause;
  }
  return current instanceof Error ? current : err;
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const root = unwrapError(err);

  if (root instanceof AppError) {
    sendError(res, root.statusCode, root.code, root.message);
    return;
  }

  if (root instanceof z.ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Validation failed", root.issues);
    return;
  }

  if (root instanceof Prisma.PrismaClientKnownRequestError) {
    if (root.code === "P2002") {
      sendError(res, 409, "CONFLICT", "Resource already exists");
      return;
    }
    if (root.code === "P2003") {
      sendError(res, 409, "CONFLICT", "Referenced resource not found");
      return;
    }
  }

  const causeFields =
    root !== err
      ? {
          causeMsg: root.message,
          causeName: root.name,
          ...(root instanceof Prisma.PrismaClientKnownRequestError
            ? { causeCode: root.code, causeMeta: root.meta }
            : {}),
        }
      : {};

  (req.log ?? logger).error(
    {
      errMsg: err.message,
      errName: err.name,
      ...causeFields,
      ...(process.env.LOG_LEVEL === "debug" && { err }),
    },
    "Unhandled error",
  );
  sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
}
