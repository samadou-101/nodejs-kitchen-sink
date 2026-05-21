import { useState, useEffect } from "react";
import { useProducts, useCategories } from "../api/use-products";
import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { CatalogHero } from "./CatalogHero";
import { FeaturedProducts } from "./FeaturedProducts";
import { CtaBanner } from "./CtaBanner";
import { EmailSignup } from "./EmailSignup";
import { CatalogFooter } from "./CatalogFooter";
import { CategoryPills } from "./CategoryPills";
import { ActiveFilters } from "./ActiveFilters";
import { EmptyCatalogState } from "./EmptyCatalogState";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "./Pagination";
import { SearchBar } from "./SearchBar";

export function ProductCatalogPage() {
  const { page, setPage, search, setSearch, categoryId, setCategoryId, resetFilters } =
    useCatalogFilters();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const { data: categories } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setPage]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, setPage]);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (debouncedSearch) params.search = debouncedSearch;
  if (categoryId) params.categoryId = categoryId;

  const { data, isLoading, isFetching } = useProducts(params);

  const categoryName = categories?.find(
    (c) => c.categoryId === categoryId,
  )?.name;

  const showEmptyState = !isLoading && data?.data && data.data.length === 0;
  const showProductGrid = data?.data && data.data.length > 0;

  return (
    <>
      <CatalogHero />

      <FeaturedProducts />

      <CtaBanner />

      <section id="catalog" className="scroll-mt-20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Catalog
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                All Products
              </h2>
            </div>
            <div className="w-full max-w-xs">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <CategoryPills
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
            />

            <ActiveFilters
              search={search}
              categoryId={categoryId}
              categoryName={categoryName}
              onClearSearch={() => setSearch("")}
              onClearCategory={() => setCategoryId(undefined)}
              onClearAll={resetFilters}
            />

            {!isLoading && !showEmptyState && (
              <p className="text-sm text-muted-foreground">
                {data?.meta?.total ?? 0} products
              </p>
            )}

            {showProductGrid && (
              <ProductGrid
                products={data.data}
                isLoading={isLoading}
                isFetching={isFetching}
              />
            )}

            {showEmptyState && (
              <EmptyCatalogState
                search={search}
                categoryName={categoryName}
                onClearAll={resetFilters}
              />
            )}

            {data?.meta && showProductGrid && (
              <Pagination
                page={page}
                total={data.meta.total}
                limit={20}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </section>

      <EmailSignup />

      <CatalogFooter />
    </>
  );
}
