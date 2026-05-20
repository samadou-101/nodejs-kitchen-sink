import { Link } from "react-router-dom";
import type { Product } from "#shared/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="block rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold">{product.name}</h3>
      {product.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      )}
      <p className="mt-2 text-lg font-bold">{product.price.toFixed(2)} DZD</p>
    </Link>
  );
}
