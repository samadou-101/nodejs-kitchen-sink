import { useParams, Link } from "react-router-dom";
import { useOrderDetail } from "../api/use-order-tracking";
import { getStatusLabel, getStatusColor } from "#shared/lib/status-labels";

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrderDetail(Number(id));

  if (isLoading) {
    return <div className="py-8 text-center">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">Order not found</p>
        <Link to="/track" className="mt-4 inline-block text-primary underline">
          Back to tracking
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/track" className="text-sm text-primary underline">
        &larr; Back to tracking
      </Link>

      <div className="mt-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.orderStatusId)}`}
          >
            {getStatusLabel(order.orderStatusId)}
          </span>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Customer Information</h2>
          <p className="text-sm text-muted-foreground">
            {order.customer.name} &mdash; {order.customer.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.customer.address}, {order.customer.email}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-2 space-y-2">
            {order.orderItems.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between border-b py-2 text-sm"
              >
                <span>
                  Product #{item.productId} × {item.quantity}
                </span>
                <span>{(item.price * item.quantity).toFixed(2)} DZD</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right font-bold">
            Total:{" "}
            {order.orderItems
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}{" "}
            DZD
          </p>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Order date: {new Date(order.orderDate).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
