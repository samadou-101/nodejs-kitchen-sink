import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#shared/api/http-client";
import { queryKeys } from "#shared/lib/query-keys";
import type { Product, Category } from "#shared/lib/types";

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      price: number;
      categoryId: number;
      initialStock?: number;
    }) => api.post<Product>("/api/ecom/product/create", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: number;
      name?: string;
      description?: string;
      price?: number;
      categoryId?: number;
    }) => api.post<Product>("/api/ecom/product/update", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/ecom/product/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useAllProducts(params?: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () =>
      api.get<Product[]>(`/api/ecom/products${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<Category>("/api/ecom/category", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { categoryId: number; name?: string; description?: string }) =>
      api.post<Category>("/api/ecom/category/update", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/ecom/category/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}
