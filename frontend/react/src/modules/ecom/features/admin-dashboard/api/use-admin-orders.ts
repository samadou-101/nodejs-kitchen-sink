import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { Order } from "#ecom/shared/lib/types";

export function useAdminOrders(params?: {
  statusId?: number;
  employeeId?: number;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.statusId) searchParams.set("statusId", String(params.statusId));
  if (params?.employeeId) searchParams.set("employeeId", String(params.employeeId));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () =>
      api.get<Order[]>(`/api/ecom/orders${qs ? `?${qs}` : ""}`),
  });
}

export function useAdminOrderDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => api.get<Order>(`/api/ecom/order/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; statusId: number }) =>
      api.patch(`/api/ecom/order/${data.id}/status`, { statusId: data.statusId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}

export function useAssignEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { orderId: number; employeeId: number }) =>
      api.patch(`/api/ecom/order/${data.orderId}/employee`, {
        employeeId: data.employeeId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}

export function useUnassignEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      api.patch(`/api/ecom/order/${orderId}/employee/remove`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}
