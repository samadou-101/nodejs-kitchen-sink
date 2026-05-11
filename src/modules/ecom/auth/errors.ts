import type { AuthContext } from "./rbac/rbac.types";
import {
  AppError,
  AuthorizationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "@/modules/ecom/shared/errors";

export {
  AppError,
  AuthorizationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};

export function assertAuth(auth: unknown): asserts auth is AuthContext {
  if (!auth) throw new UnauthorizedError("Authentication required");
}

export function checkAuthz(result: {
  allowed: boolean;
  reason?: string | undefined;
}) {
  if (!result.allowed) throw new ForbiddenError(result.reason ?? "Forbidden");
}
