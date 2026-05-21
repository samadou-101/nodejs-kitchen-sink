import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { Inventory } from "#ecom/shared/lib/types";

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: number; action: "increase" | "decrease"; amount: number }) =>
      api.post("/api/ecom/admin/inventory/adjust", data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.inventory.all }),
  });
}

export function useLowStock(threshold = 10) {
  return useQuery({
    queryKey: queryKeys.admin.inventory.lowStock(threshold),
    queryFn: () =>
      api.get<Inventory[]>(
        `/api/ecom/admin/inventory/low-stock?threshold=${threshold}`,
      ),
  });
}
