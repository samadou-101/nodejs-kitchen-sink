const statusLabels: Record<number, string> = {
  1: "Pending",
  2: "Confirmed",
  3: "Shipped",
  4: "Delivered",
  5: "Cancelled",
};

const statusColors: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-green-100 text-green-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-emerald-100 text-emerald-800",
  5: "bg-red-100 text-red-800",
};

export function getStatusLabel(statusId: number): string {
  return statusLabels[statusId] ?? `Unknown (${statusId})`;
}

export function getStatusColor(statusId: number): string {
  return statusColors[statusId] ?? "bg-gray-100 text-gray-800";
}
