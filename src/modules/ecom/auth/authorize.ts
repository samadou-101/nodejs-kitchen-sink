import type { AuthContext } from "./rbac/rbac.types";
import type { Policy } from "./policies/rules";
import { AuthorizationError } from "./errors";

export function authorize(auth: AuthContext, policy: Policy): void {
  const allowed = policy(auth);
  if (!allowed) {
    throw new AuthorizationError("Access denied");
  }
}

export function authorizeWithReason(
  auth: AuthContext,
  policy: Policy
): { allowed: boolean; reason: string | undefined } {
  const allowed = policy(auth);
  return {
    allowed,
    reason: allowed ? undefined : "Access denied",
  };
}

export type { Policy } from "./policies/rules";