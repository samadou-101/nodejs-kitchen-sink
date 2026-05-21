import { useMutation } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import type { Order } from "#ecom/shared/lib/types";

export function usePlaceOrder() {
  return useMutation({
    mutationFn: (data: {
      name: string;
      phone: string;
      address: string;
      city: string;
      notes?: string;
      items: { productId: number; quantity: number }[];
    }) => api.post<Order>("/api/ecom/checkout", data),
  });
}
