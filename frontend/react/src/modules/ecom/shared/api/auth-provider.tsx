import { createContext, useContext, type ReactNode } from "react";
import { useAuthSession } from "./use-auth-session";
import type { AuthContext } from "#ecom/shared/lib/types";

interface AuthProviderValue {
  user: AuthContext | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isSuperAdmin: boolean;
}

const AuthContext_ = createContext<AuthProviderValue>({
  user: undefined,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isEmployee: false,
  isSuperAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useAuthSession();

  const value: AuthProviderValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!user && user.roleNames.some((r) => r === "ADMIN" || r === "SUPERADMIN"),
    isEmployee: !!user && user.roleNames.includes("EMPLOYEE"),
    isSuperAdmin: !!user?.isSuperAdmin,
  };

  return <AuthContext_.Provider value={value}>{children}</AuthContext_.Provider>;
}

export function useAuth() {
  return useContext(AuthContext_);
}
