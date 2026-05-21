import { Link } from "react-router-dom";

interface OrderConfirmationProps {
  orderId: number;
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600 animate-in zoom-in-50 duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Order Placed!</h1>
      <p className="mt-2 text-muted-foreground">
        Your order reference: <strong className="text-foreground">#{orderId}</strong>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        We'll contact you for delivery confirmation.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs hover:bg-muted">Continue Shopping</Link>
        <Link to="/track" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">Track Your Order</Link>
      </div>
    </div>
  );
}
