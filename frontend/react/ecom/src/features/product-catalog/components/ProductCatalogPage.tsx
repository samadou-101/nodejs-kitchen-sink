import { useState, useEffect } from "react";
import { useProducts } from "../api/use-products";
import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { Pagination } from "./Pagination";

export function ProductCatalogPage() {
  const { page, setPage, search, setSearch, categoryId, setCategoryId } =
    useCatalogFilters();
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setPage]);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (debouncedSearch) params.search = debouncedSearch;
  if (categoryId) params.categoryId = categoryId;

  const { data, isLoading } = useProducts(params);

  return (
    <div className="mx-auto max-w-7xl py-8">
      <h1 className="text-2xl font-bold">Products</h1>
      <div className="mt-4 flex gap-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <CategoryFilter value={categoryId} onChange={setCategoryId} />
      </div>
      <div className="mt-6">
        <ProductGrid products={data?.data} isLoading={isLoading} />
      </div>
      {data?.meta && (
        <Pagination
          page={page}
          total={data.meta.total}
          limit={20}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
