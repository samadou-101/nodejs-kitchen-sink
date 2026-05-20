import { Link } from "react-router-dom";
import type { Order } from "#shared/lib/types";
import { getStatusLabel } from "#shared/lib/status-labels";
import { Badge } from "#components/components/ui/badge";
import { Skeleton } from "#components/components/ui/skeleton";

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

interface OrderTrackResultProps {
  orders: Order[] | undefined;
  isLoading: boolean;
  searched: boolean;
}

export function OrderTrackResult({
  orders,
  isLoading,
  searched,
}: OrderTrackResultProps) {
  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!searched) return null;

  if (!orders || orders.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No orders found for this phone number
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-lg font-semibold">
        Found {orders.length} order{orders.length > 1 ? "s" : ""}
      </h2>
      {orders.map((order) => (
        <Link
          key={order.orderId}
          to={`/track/${order.orderId}`}
          className="block rounded-xl border bg-card p-4 shadow-xs transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order #{order.orderId}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={getStatusVariant(order.orderStatusId)}>
              {getStatusLabel(order.orderStatusId)}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
