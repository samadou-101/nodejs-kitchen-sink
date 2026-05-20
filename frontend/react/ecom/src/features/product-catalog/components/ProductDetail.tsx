import { useParams, Link } from "react-router-dom";
import { useProduct } from "../api/use-products";
import { SkeletonCard } from "./SkeletonCard";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(Number(id));

  if (isLoading) return <SkeletonCard />;

  if (error || !product) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">Product not found</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/" className="text-sm text-primary underline">&larr; Back to products</Link>
      <div className="mt-4 rounded-lg border p-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        {product.description && (
          <p className="mt-4 text-muted-foreground">{product.description}</p>
        )}
        <p className="mt-6 text-3xl font-bold">{product.price.toFixed(2)} DZD</p>
      </div>
    </div>
  );
}
