const BASE_URL =
  typeof import.meta !== "undefined"
    ? (import.meta.env?.VITE_API_URL ?? "")
    : "";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface SuccessResponseWithMeta<T, M> {
  success: true;
  data: T;
  meta: M;
}

interface ErrorResponse {
  success: false;
  error: { code: string; message: string };
}

type ApiResponse<T, M = never> =
  | SuccessResponse<T>
  | SuccessResponseWithMeta<T, M>
  | ErrorResponse;

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResult<T, M = PaginatedMeta> {
  data: T;
  meta: M;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body: ApiResponse<T, unknown> = await res.json();

  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message);
  }

  return body.data;
}

async function requestWithMeta<T, M = PaginatedMeta>(
  url: string,
  options?: RequestInit,
): Promise<PaginatedResult<T, M>> {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await res.json();

  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message);
  }

  return { data: body.data as T, meta: body.meta as M };
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  getWithMeta: <T, M = PaginatedMeta>(url: string) =>
    requestWithMeta<T, M>(url),
  post: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
