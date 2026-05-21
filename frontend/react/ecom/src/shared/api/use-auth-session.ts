import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./http-client";
import { queryKeys } from "#shared/lib/query-keys";
import type { AuthContext } from "#shared/lib/types";

export function useAuthSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => api.get<AuthContext>("/api/ecom/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await api.post("/api/ecom/logout");
    } catch {
      // Clear local auth state even if server-side revocation fails
    }
    queryClient.setQueryData(queryKeys.auth.session(), null);
    queryClient.clear();
  };
}
