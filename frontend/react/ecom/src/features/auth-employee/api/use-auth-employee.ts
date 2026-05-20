import { useMutation } from "@tanstack/react-query";
import { api } from "#shared/api/http-client";
import type { AuthContext } from "#shared/lib/types";

export function useEmployeeSignup() {
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }) => api.post<AuthContext>("/api/ecom/employee/signup", data),
  });
}

export function useEmployeeLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthContext>("/api/ecom/employee/login", data),
  });
}
