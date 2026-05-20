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
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1">
          {items.map((item) => (
            <CartItemRow
              key={item.productId}
              {...item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
        <div className="w-full lg:w-72">
          <CartSummary totalItems={totalItems} totalPrice={totalPrice} />
          <Link to="/checkout" className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
