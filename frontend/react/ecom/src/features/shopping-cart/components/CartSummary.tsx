import { Card, CardContent, CardHeader, CardTitle } from "#components/components/ui/card";

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
}

export function CartSummary({ totalItems, totalPrice }: CartSummaryProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Cart Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{totalPrice.toFixed(2)} DZD</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-lg font-bold">
          <span>Total</span>
          <span>{totalPrice.toFixed(2)} DZD</span>
        </div>
      </CardContent>
    </Card>
  );
}
