import { useAuth } from "#shared/api/auth-provider";
import type { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  role: "admin" | "employee";
  fallback?: ReactNode;
}

export function AuthGuard({ children, role, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated, isAdmin, isEmployee } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  if (role === "admin" && !isAdmin) {
    if (fallback) return <>{fallback}</>;
    return <div className="p-8 text-center text-red-600">Access denied. Admin role required.</div>;
  }

  if (role === "employee" && !isEmployee) {
    if (fallback) return <>{fallback}</>;
    return <div className="p-8 text-center text-red-600">Access denied. Employee role required.</div>;
  }

  return <>{children}</>;
}
