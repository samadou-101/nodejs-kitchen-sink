import { Link } from "react-router-dom";

interface OrderConfirmationProps {
  orderId: number;
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="text-2xl font-bold">Order Placed!</h1>
      <p className="mt-2 text-muted-foreground">
        Your order reference: <strong className="text-foreground">#{orderId}</strong>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        We'll contact you for delivery confirmation.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/" className="text-primary underline">
          Continue shopping
        </Link>
        <Link to="/track" className="text-primary underline">
          Track your order
        </Link>
      </div>
    </div>
  );
}
