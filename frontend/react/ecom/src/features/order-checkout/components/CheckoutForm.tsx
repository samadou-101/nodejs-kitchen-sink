import { useCart } from "../../shopping-cart/hooks/use-cart";
import { useCheckout } from "../hooks/use-checkout";
import { getErrorMessage } from "#shared/lib/error-map";

interface CheckoutFormProps {
  onSuccess: (orderId: number) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { items, totalPrice, clear } = useCart();
  const { form, errors, setField, submit, isSubmitting, error } =
    useCheckout((orderId) => {
      clear();
      onSuccess(orderId);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    await submit(
      items.map((i: { productId: number; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Add items to your cart first
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Checkout</h2>

      {error && (
        <p className="text-sm text-red-600">
          {getErrorMessage((error as { code?: string }).code ?? "", error.message)}
        </p>
      )}

      <div>
        <label htmlFor="checkout-name" className="block text-sm font-medium">Name</label>
        <input
          id="checkout-name"
          type="text"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          className="mt-1 block w-full rounded border p-2"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="checkout-phone" className="block text-sm font-medium">Phone</label>
        <input
          id="checkout-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className="mt-1 block w-full rounded border p-2"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="checkout-address" className="block text-sm font-medium">Address</label>
        <input
          id="checkout-address"
          type="text"
          value={form.address}
          onChange={(e) => setField("address", e.target.value)}
          className="mt-1 block w-full rounded border p-2"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address}</p>
        )}
      </div>

      <div>
        <label htmlFor="checkout-city" className="block text-sm font-medium">City</label>
        <input
          id="checkout-city"
          type="text"
          value={form.city}
          onChange={(e) => setField("city", e.target.value)}
          className="mt-1 block w-full rounded border p-2"
        />
        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
      </div>

      <div>
        <label htmlFor="checkout-notes" className="block text-sm font-medium">Notes (optional)</label>
        <textarea
          id="checkout-notes"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          rows={3}
        />
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-semibold">
          Total: {totalPrice.toFixed(2)} DZD ({items.length} items)
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-primary px-4 py-3 text-primary-foreground disabled:opacity-50"
      >
        {isSubmitting ? "Placing order..." : "Place Order (COD)"}
      </button>
    </form>
  );
}
