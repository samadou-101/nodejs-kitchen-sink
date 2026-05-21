import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#shared/api/http-client";
import { queryKeys } from "#shared/lib/query-keys";

export function useEmployeeSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }) => api.post<{ name: string; email: string }>("/api/ecom/employee/signup", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}

export function useEmployeeLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<{ name: string; email: string }>("/api/ecom/employee/login", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}
