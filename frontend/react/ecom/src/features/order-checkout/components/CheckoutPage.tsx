import { useState } from "react";
import { CheckoutForm } from "./CheckoutForm";
import { OrderConfirmation } from "./OrderConfirmation";

export function CheckoutPage() {
  const [orderId, setOrderId] = useState<number | undefined>(undefined);

  if (orderId) {
    return <OrderConfirmation orderId={orderId} />;
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <CheckoutForm onSuccess={(id) => setOrderId(id)} />
    </div>
  );
}
