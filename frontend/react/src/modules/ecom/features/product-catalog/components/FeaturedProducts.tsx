import { useProducts } from "../api/use-products";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "./SkeletonCard";

export function FeaturedProducts() {
  const { data, isLoading } = useProducts({ limit: 8, page: 1 });

  const products = data?.data ?? [];

  return (
    <section id="featured" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Curated Selection
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Drops
            </h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : products.slice(0, 8).map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}
