import { Link } from "react-router-dom";

export function EmptyCart() {
  return (
    <div className="py-16 text-center">
      <p className="text-lg text-muted-foreground">Your cart is empty</p>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        Continue shopping
      </Link>
    </div>
  );
}
