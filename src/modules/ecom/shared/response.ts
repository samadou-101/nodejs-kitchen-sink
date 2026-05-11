import type { Response } from "express";
import type { ApiResponse, PaginationMeta, ApiError } from "./response.types";

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
): void {
  const body: ApiResponse<T[]> = { success: true, data, meta };
  res.status(200).json(body);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const error: ApiError = { code, message };
  if (details !== undefined) error.details = details;
  const body: ApiResponse = { success: false, error };
  res.status(status).json(body);
}
