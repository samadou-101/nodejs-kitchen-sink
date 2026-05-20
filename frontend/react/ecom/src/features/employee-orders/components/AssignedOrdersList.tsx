import { useState } from "react";
import { useAssignedOrders, useConfirmOrder, useRejectOrder } from "../api/use-employee-orders";
import { getStatusLabel } from "#shared/lib/status-labels";
import { ConfirmDialog } from "./ConfirmDialog";
import { getErrorMessage } from "#shared/lib/error-map";
import { Badge } from "#components/components/ui/badge";
import { Button } from "#components/components/ui/button";
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

  if (isLoading) {
    return (
      <div className="space-y-3 py-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p className="mt-4 text-muted-foreground">No orders assigned to you</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold">My Assigned Orders</h2>
      {error && (
        <div className="mt-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div key={order.orderId} className="rounded-xl border bg-card p-4 shadow-xs transition-all hover:shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Order #{order.orderId}</p>
                  <Badge variant={getStatusVariant(order.orderStatusId)}>
                    {getStatusLabel(order.orderStatusId)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.customer.name} &mdash; {order.customer.phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>

              {order.orderStatusId === 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(order.orderId!)}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setConfirmId(order.orderId)}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
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
