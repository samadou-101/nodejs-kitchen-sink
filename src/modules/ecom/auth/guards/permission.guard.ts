import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../rbac/rbac.context";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "../rbac/rbac.matcher";

export function requirePermission(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const auth = req.auth;

    if (!auth) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const allowed = hasAllPermissions(auth.permissions, requiredPermissions);

    if (!allowed) {
      res.status(403).json({
        error: "Insufficient permissions",
        required: requiredPermissions,
        actual: auth.permissions,
      });
      return;
    }

    next();
  };
}

export function requireAnyPermission(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const auth = req.auth;

    if (!auth) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const allowed = hasAnyPermission(auth.permissions, requiredPermissions);

    if (!allowed) {
      res.status(403).json({
        error: "Insufficient permissions",
        requiredAnyOf: requiredPermissions,
        actual: auth.permissions,
      });
      return;
    }

    next();
  };
}

export function requireWildcardPermission(resource: string) {
  return requirePermission(`${resource}:*`);
}