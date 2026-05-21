import { useQuery } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { Order } from "#ecom/shared/lib/types";

export function useTrackOrders(phone: string) {
  return useQuery({
    queryKey: queryKeys.orders.track(phone),
    queryFn: () =>
      api.get<Order[]>(`/api/ecom/orders/track?phone=${encodeURIComponent(phone)}`),
    enabled: !!phone,
  });
}

export function useOrderDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => api.get<Order>(`/api/ecom/orders/${id}`),
    enabled: !!id,
  });
}
