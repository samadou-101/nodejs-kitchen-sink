import type { Response } from "express";
import { z } from "zod";

export function handleValidationError(res: Response, error: unknown): boolean {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.issues,
    });
    return true;
  }
  return false;
}
