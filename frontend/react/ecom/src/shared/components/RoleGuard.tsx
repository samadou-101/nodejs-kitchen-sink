import { useAuth } from "#shared/api/auth-provider";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  fallback?: ReactNode;
}

export function RoleGuard({ children, requireSuperAdmin, fallback }: RoleGuardProps) {
  const { isSuperAdmin } = useAuth();

  if (requireSuperAdmin && !isSuperAdmin) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  return <>{children}</>;
}
