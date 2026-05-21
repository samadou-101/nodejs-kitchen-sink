import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useProduct } from "../api/use-products";
import { useCart } from "../../shopping-cart/hooks/use-cart";
import { ProductImage } from "#ecom/shared/components/ProductImage";
import { Skeleton } from "#components/ui/skeleton";
import { Button } from "#components/ui/button";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(Number(id));
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mt-4 aspect-video w-full" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-4 h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="mt-4 text-muted-foreground">Product not found</p>
        <Link to="/" className="mt-4 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline">&larr; Back to products</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ id: product.productId, name: product.name, price: product.price, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/" className="mb-4 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline">&larr; Back to products</Link>

      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        aspect="16:9"
        size="lg"
      />

      <div className="mt-6 space-y-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        {product.description && (
          <p className="leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <p className="text-3xl font-bold">{product.price.toFixed(2)} DZD</p>

        <Button size="lg" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
