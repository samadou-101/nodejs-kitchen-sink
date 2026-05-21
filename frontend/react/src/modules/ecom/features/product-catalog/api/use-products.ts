import { useQuery } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { Product, Category } from "#ecom/shared/lib/types";

export function useProducts(params?: Record<string, unknown>) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.categoryId) searchParams.set("categoryId", String(params.categoryId));

  const qs = searchParams.toString();

  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () =>
      api.getWithMeta<Product[], { page: number; limit: number; total: number }>(
        `/api/ecom/products${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => api.get<Product>(`/api/ecom/product/${id}`),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => api.get<Category[]>("/api/ecom/categories"),
  });
}
