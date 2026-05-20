interface CartItemRowProps {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItemRow({
  productId,
  name,
  price,
  quantity,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const subtotal = price * quantity;

  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {price.toFixed(2)} DZD × {quantity}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(productId, quantity - 1)}
          className="h-8 w-8 rounded border"
        >
          -
        </button>
        <span className="w-8 text-center">{quantity}</span>
        <button
          onClick={() => onUpdateQuantity(productId, quantity + 1)}
          className="h-8 w-8 rounded border"
        >
          +
        </button>
      </div>
      <p className="ml-4 w-24 text-right font-semibold">{subtotal.toFixed(2)} DZD</p>
      <button
        onClick={() => onRemove(productId)}
        className="ml-4 text-sm text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
