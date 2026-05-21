import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#shared/api/http-client";
import { queryKeys } from "#shared/lib/query-keys";

export function useAdminSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post<{ name: string; email: string }>("/api/ecom/admin/signup", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<{ name: string; email: string }>("/api/ecom/admin/login", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}
