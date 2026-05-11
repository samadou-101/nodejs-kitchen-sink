// permissions.matcher.ts



/**
 * Core permission matching engine
 * No expansion, no preprocessing
 * Direct evaluation
 */

import type { Permission } from "./rbac.types";

export function matchesPermission(required: string, granted: string): boolean {
  // Full system wildcard
  if (granted === "*" || granted === "*:*") return true;

  const [reqResource, reqAction] = required.split(":");
  const [grantedResource, grantedAction] = granted.split(":");

  // Resource-level wildcard: order:*
  if (grantedAction === "*") {
    return grantedResource === reqResource;
  }

  // Exact match fallback
  return required === granted;
}

/**
 * Checks if user has a specific permission
 */
export function hasPermission(
  permissions: Permission[],
  required: string,
): boolean {
  return permissions.some((p) => matchesPermission(required, p));
}

/**
 * At least one permission matches
 */
export function hasAnyPermission(
  permissions: Permission[],
  required: string[],
): boolean {
  return required.some((r) => hasPermission(permissions, r));
}

/**
 * All permissions must match
 */
export function hasAllPermissions(
  permissions: Permission[],
  required: string[],
): boolean {
  return required.every((r) => hasPermission(permissions, r));
}

/**
 * Shortcut for resource wildcard check
 */
export function hasWildcard(
  resource: string,
  permissions: Permission[],
): boolean {
  return hasPermission(permissions, `${resource}:*`);
}

/**
 * Parse permission string into structured form
 */
export function parsePermissionString(permission: string): {
  resource: string;
  action: string;
} {
  const parts = permission.split(":");

  return {
    resource: parts[0] ?? "",
    action: parts[1] ?? "*",
  };
}
