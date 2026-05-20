import { useCart } from "../../shopping-cart/hooks/use-cart";
import { useCheckout } from "../hooks/use-checkout";
import { getErrorMessage } from "#shared/lib/error-map";
import { Field } from "#shared/components/Field";
import { Input } from "#components/components/ui/input";
import { Textarea } from "#components/components/ui/textarea";
import { Button } from "#components/components/ui/button";
import { ProductImage } from "#shared/components/ProductImage";
import { Card, CardContent, CardHeader, CardTitle } from "#components/components/ui/card";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Checkout</h2>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage((error as { code?: string }).code ?? "", error.message)}
        </div>
      )}

      <Card size="sm">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Name" error={errors.name}>
            <Input
              id="checkout-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Phone" error={errors.phone}>
            <Input
              id="checkout-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Your phone number"
            />
          </Field>

          <Field label="Address" error={errors.address}>
            <Input
              id="checkout-address"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Your delivery address"
            />
          </Field>

          <Field label="City" error={errors.city}>
            <Input
              id="checkout-city"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="Your city"
            />
          </Field>

          <Field label="Notes (optional)" error={null}>
            <Textarea
              id="checkout-notes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Any delivery notes"
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <ProductImage src={item.imageUrl} alt={item.name} aspect="1:1" size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {item.price.toFixed(2)} DZD
                </p>
              </div>
              <p className="text-sm font-semibold">
                {(item.price * item.quantity).toFixed(2)} DZD
              </p>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{totalPrice.toFixed(2)} DZD</span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Placing order..." : "Place Order (COD)"}
      </Button>
    </form>
  );
}
