import type { Product } from "#ecom/shared/lib/types";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "./SkeletonCard";

interface ProductGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
  isFetching?: boolean;
}

export function ProductGrid({ products, isLoading, isFetching }: ProductGridProps) {
  const transitionClass =
    isFetching && !isLoading
      ? "transition-opacity duration-200 opacity-50"
      : "opacity-100";

  if (isLoading) {
    return (
      <div className={transitionClass}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={transitionClass}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.productId}
            className="animate-in fade-in slide-in-from-bottom-1 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
