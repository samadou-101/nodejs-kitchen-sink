import { useParams, Link } from "react-router-dom";
import { useOrderDetail } from "../api/use-order-tracking";
import { getStatusLabel } from "#shared/lib/status-labels";
import type { OrderItem } from "#shared/lib/types";
import { Badge } from "#components/components/ui/badge";
import { Skeleton } from "#components/components/ui/skeleton";
import { ProductImage } from "#shared/components/ProductImage";
import { Card, CardContent, CardHeader, CardTitle } from "#components/components/ui/card";

const statusVariants: Record<number, "amber" | "emerald" | "blue" | "green" | "red"> = {
  1: "amber",
  2: "emerald",
  3: "blue",
  4: "green",
  5: "red",
};

function getStatusVariant(statusId: number): "amber" | "emerald" | "blue" | "green" | "red" {
  return statusVariants[statusId] ?? "default";
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrderDetail(Number(id));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-8 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/track" className="mt-4 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline">&larr; Back to tracking</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8 space-y-6">
      <Link to="/track" className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline">&larr; Back to tracking</Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
        <Badge variant={getStatusVariant(order.orderStatusId)}>
          {getStatusLabel(order.orderStatusId)}
        </Badge>
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{order.customer.name} &mdash; {order.customer.phone}</p>
          <p className="text-muted-foreground">
            {order.customer.address}, {order.customer.email}
          </p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.orderItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <ProductImage
                src={(item as OrderItem & { imageUrl?: string }).imageUrl}
                alt={`Product #${item.productId}`}
                aspect="1:1"
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Product #{item.productId}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {item.price.toFixed(2)} DZD
                </p>
              </div>
              <p className="text-sm font-semibold">
                {(item.price * item.quantity).toFixed(2)} DZD
              </p>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-lg font-bold">
            <span>Total</span>
            <span>
              {order.orderItems
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}{" "}
              DZD
            </span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Order date: {new Date(order.orderDate).toLocaleString()}
      </p>
    </div>
  );
}
