import type { AuthContext } from "./rbac/rbac.types";

export class AuthorizationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export function assertAuth(auth: unknown): asserts auth is AuthContext {
  if (!auth) throw new UnauthorizedError("Authentication required");
}

export function checkAuthz(result: { allowed: boolean; reason?: string | undefined }) {
  if (!result.allowed) throw new ForbiddenError(result.reason ?? "Forbidden");
}