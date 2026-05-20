import { Link } from "react-router-dom";
import { useCart } from "../hooks/use-cart";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

export function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      <div className="mt-6">
        {items.map((item) => (
          <CartItemRow
            key={item.productId}
            {...item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      <div className="mt-6 flex items-start justify-between">
        <CartSummary totalItems={totalItems} totalPrice={totalPrice} />
        <Link
          to="/checkout"
          className="rounded bg-primary px-6 py-3 text-primary-foreground"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
