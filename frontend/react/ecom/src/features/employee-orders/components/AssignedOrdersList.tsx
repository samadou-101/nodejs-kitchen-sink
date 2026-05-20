import { useState } from "react";
import { useAssignedOrders, useConfirmOrder, useRejectOrder } from "../api/use-employee-orders";
import { getStatusLabel, getStatusColor } from "#shared/lib/status-labels";
import { ConfirmDialog } from "./ConfirmDialog";
import { getErrorMessage } from "#shared/lib/error-map";

export function AssignedOrdersList() {
  const { data: orders, isLoading } = useAssignedOrders();
  const confirm = useConfirmOrder();
  const reject = useRejectOrder();
  const [confirmId, setConfirmId] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");

  const handleConfirm = async (id: number) => {
    setError("");
    try {
      await confirm.mutateAsync(id);
      setConfirmId(undefined);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const apiErr = err as { code?: string };
        setError(getErrorMessage(apiErr.code ?? "", err.message));
      }
    }
  };

  const handleReject = async (id: number) => {
    setError("");
    try {
      await reject.mutateAsync(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const apiErr = err as { code?: string };
        setError(getErrorMessage(apiErr.code ?? "", err.message));
      }
    }
  };

  if (isLoading) return <div className="py-8 text-center">Loading assigned orders...</div>;

  if (!orders || orders.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No orders assigned to you</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold">My Assigned Orders</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div key={order.orderId} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order #{order.orderId}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.name} &mdash; {order.customer.phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.orderStatusId)}`}
              >
                {getStatusLabel(order.orderStatusId)}
              </span>
            </div>

            {order.orderStatusId === 1 && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setConfirmId(order.orderId)}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleReject(order.orderId!)}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmId && (
        <ConfirmDialog
          orderId={confirmId}
          onConfirm={() => handleConfirm(confirmId)}
          onCancel={() => setConfirmId(undefined)}
          isPending={confirm.isPending}
        />
      )}
    </div>
  );
}
