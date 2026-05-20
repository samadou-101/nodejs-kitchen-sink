import { useMutation } from "@tanstack/react-query";
import { api } from "#shared/api/http-client";
import type { AuthContext } from "#shared/lib/types";

export function useAdminSignup() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post<AuthContext>("/api/ecom/admin/signup", data),
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthContext>("/api/ecom/admin/login", data),
  });
}
