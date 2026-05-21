import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { Order } from "#ecom/shared/lib/types";

export function useAssignedOrders() {
  return useQuery({
    queryKey: queryKeys.employee.orders.list(),
    queryFn: () => api.get<Order[]>("/api/ecom/employee/orders"),
  });
}

export function useAssignedOrderDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.employee.orders.detail(id),
    queryFn: () => api.get<Order>(`/api/ecom/employee/orders/${id}`),
    enabled: !!id,
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/api/ecom/employee/orders/${id}/confirm`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.employee.orders.all }),
  });
}

export function useRejectOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/api/ecom/employee/orders/${id}/reject`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.employee.orders.all }),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; notes: string }) =>
      api.post(`/api/ecom/employee/orders/${data.id}/notes`, {
        notes: data.notes,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.employee.orders.all }),
  });
}
