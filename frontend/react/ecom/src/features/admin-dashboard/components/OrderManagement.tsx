import { useState } from "react";
import {
  useAdminOrders,
  useUpdateOrderStatus,
} from "../api/use-admin-orders";
import { getStatusLabel } from "#shared/lib/status-labels";
import { Badge } from "#components/components/ui/badge";
import { Select } from "#components/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "#components/components/ui/table";

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

export function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const { data: orders } = useAdminOrders({ statusId: statusFilter });
  const updateStatus = useUpdateOrderStatus();

  return (
    <div>
      <h2 className="text-xl font-bold">Order Management</h2>

      <div className="mt-4 flex gap-2">
        <Select
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">All statuses</option>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="font-medium">#{order.orderId}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell className="text-muted-foreground">{order.customer.phone}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.orderStatusId)}>
                    {getStatusLabel(order.orderStatusId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.orderStatusId}
                    onChange={(e) =>
                      updateStatus.mutate({
                        id: order.orderId!,
                        statusId: Number(e.target.value),
                      })
                    }
                    className="w-32"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {getStatusLabel(s)}
                      </option>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
