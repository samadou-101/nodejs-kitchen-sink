import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../rbac/rbac.context";
import type { RoleName } from "../rbac/rbac.types";

export function requireRole(...requiredRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const auth = req.auth;

    if (!auth) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const hasRole = requiredRoles.some((role) => auth.roleNames.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: "Insufficient role",
        required: requiredRoles,
        actual: auth.roleNames,
      });
      return;
    }

    next();
  };
}

export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!req.auth.isSuperAdmin) {
    res.status(403).json({ error: "SuperAdmin access required" });
    return;
  }

  next();
}