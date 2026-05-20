import { useState } from "react";
import {
  useAdminOrders,
  useUpdateOrderStatus,
} from "../api/use-admin-orders";
import { getStatusLabel, getStatusColor } from "#shared/lib/status-labels";

export function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const { data: orders } = useAdminOrders({ statusId: statusFilter });
  const updateStatus = useUpdateOrderStatus();

  return (
    <div>
      <h2 className="text-xl font-bold">Order Management</h2>

      <div className="mt-4 flex gap-2">
        <select
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter(e.target.value ? Number(e.target.value) : undefined)
          }
          className="rounded border p-2"
        >
          <option value="">All statuses</option>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {orders?.map((order) => (
          <div key={order.orderId} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order #{order.orderId}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.name} &mdash; {order.customer.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={order.orderStatusId}
                  onChange={(e) =>
                    updateStatus.mutate({
                      id: order.orderId!,
                      statusId: Number(e.target.value),
                    })
                  }
                  className={`rounded px-2 py-1 text-sm ${getStatusColor(order.orderStatusId)}`}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      {getStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
