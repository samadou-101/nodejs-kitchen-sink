import { useAssignedOrderDetail } from "../api/use-employee-orders";

interface ConfirmDialogProps {
  orderId: number;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ConfirmDialog({ orderId, onConfirm, onCancel, isPending }: ConfirmDialogProps) {
  const { data: order, isLoading } = useAssignedOrderDetail(orderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold">Confirm Order #{orderId}</h3>

        {isLoading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading order details...</p>
        ) : order ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm">
              <strong>Customer:</strong> {order.customer.name} &mdash; {order.customer.phone}
            </p>
            <p className="text-sm">
              <strong>Address:</strong> {order.customer.address}, {order.customer.email}
            </p>
            <div className="mt-2 border-t pt-2">
              <p className="text-sm font-semibold">Items:</p>
              {order.orderItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    Product #{item.productId} × {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} DZD</span>
                </div>
              ))}
              <p className="mt-2 text-right font-bold">
                Total:{" "}
                {order.orderItems
                  .reduce((s, i) => s + i.price * i.quantity, 0)
                  .toFixed(2)}{" "}
                DZD
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? "Confirming..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
