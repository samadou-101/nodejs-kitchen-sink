interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
}

export function CartSummary({ totalItems, totalPrice }: CartSummaryProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Cart Summary</h3>
      <div className="mt-2 space-y-1 text-sm">
        <p>Items: {totalItems}</p>
        <p className="text-lg font-bold">Total: {totalPrice.toFixed(2)} DZD</p>
      </div>
    </div>
  );
}
