import { Link } from "react-router-dom";
import type { Order } from "#shared/lib/types";
import { getStatusLabel, getStatusColor } from "#shared/lib/status-labels";

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
    return <div className="py-8 text-center">Searching for orders...</div>;
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
          className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order #{order.orderId}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.orderStatusId)}`}
            >
              {getStatusLabel(order.orderStatusId)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
