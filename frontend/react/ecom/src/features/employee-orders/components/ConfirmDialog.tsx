import { useAssignedOrderDetail } from "../api/use-employee-orders";
import type { OrderItem } from "#shared/lib/types";
import { Dialog, DialogTrigger, DialogPopup, DialogTitle, DialogDescription } from "#components/components/ui/dialog";
import { Button } from "#components/components/ui/button";
import { ProductImage } from "#shared/components/ProductImage";
import { Skeleton } from "#components/components/ui/skeleton";

interface ConfirmDialogProps {
  orderId: number;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ConfirmDialog({ orderId, onConfirm, onCancel, isPending }: ConfirmDialogProps) {
  const { data: order, isLoading } = useAssignedOrderDetail(orderId);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogTrigger />
      <DialogPopup className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>Confirm Order #{orderId}</DialogTitle>
        <DialogDescription>
          Review the order details before confirming
        </DialogDescription>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : order ? (
            <div className="space-y-3">
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Customer:</strong> {order.customer.name} &mdash;{" "}
                  {order.customer.phone}
                </p>
                <p>
                  <strong>Address:</strong> {order.customer.address},{" "}
                  {order.customer.email}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="mb-2 text-sm font-semibold">Items:</p>
                <div className="space-y-2">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 text-sm"
                    >
                      <ProductImage
                        src={(item as OrderItem & { imageUrl?: string }).imageUrl}
                        alt={`Product #${item.productId}`}
                        aspect="1:1"
                        size="sm"
                      />
                      <div className="flex-1">
                        <p>Product #{item.productId} × {item.quantity}</p>
                      </div>
                      <span className="font-medium">
                        {(item.price * item.quantity).toFixed(2)} DZD
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-right font-bold">
                  Total:{" "}
                  {order.orderItems
                    .reduce((s, i) => s + i.price * i.quantity, 0)
                    .toFixed(2)}{" "}
                  DZD
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Confirming..." : "Confirm Order"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
