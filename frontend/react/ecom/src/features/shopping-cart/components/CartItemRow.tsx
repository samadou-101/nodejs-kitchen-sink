import { ProductImage } from "#shared/components/ProductImage";
import { Button } from "#components/components/ui/button";

interface CartItemRowProps {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItemRow({
  productId,
  name,
  price,
  quantity,
  imageUrl,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const subtotal = price * quantity;

  return (
    <div className="flex flex-col gap-3 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <ProductImage src={imageUrl} alt={name} aspect="1:1" size="sm" />
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {price.toFixed(2)} DZD
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end sm:gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => onUpdateQuantity(productId, quantity - 1)}
          >
            -
          </Button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => onUpdateQuantity(productId, quantity + 1)}
          >
            +
          </Button>
        </div>
        <p className="w-24 text-right font-semibold">{subtotal.toFixed(2)} DZD</p>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(productId)}
          className="text-destructive"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
