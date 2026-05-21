import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from "#ecom/shared/lib/types";
import { ProductImage } from "#ecom/shared/components/ProductImage";
import { useCart } from "../../shopping-cart/hooks/use-cart";
import { Button } from "#components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.productId, name: product.name, price: product.price, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/product/${product.productId}`}
      className="group/card block overflow-hidden rounded-xl border bg-card shadow-xs transition-all duration-200 hover:shadow-md"
    >
      <div className="relative overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          aspect="4:3"
        />
        <div className="absolute inset-0 flex translate-y-2 items-end justify-center p-3 opacity-0 transition-all duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="w-full shadow-lg"
          >
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="mt-2 text-lg font-bold">{product.price.toFixed(2)} DZD</p>
      </div>
    </Link>
  );
}
