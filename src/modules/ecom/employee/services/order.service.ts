import { prisma } from "@/config/db.config";
import { bind } from "../repo/order.repo";

export async function getAssignedOrders(employeeId: number) {
  return await bind(prisma).findAssignedOrders(employeeId);
}

export async function getOrderById(orderId: number) {
  return await bind(prisma).findOrderById(orderId);
}

export async function confirmOrder(orderId: number) {
  const db = bind(prisma);
  const order = await db.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.orderStatusId === 1) {
    const { updateOrderStatus } = await import("@/modules/ecom/order/order.service");
    return updateOrderStatus(orderId, 2);
  }
  return order;
}

export async function rejectOrder(orderId: number) {
  const db = bind(prisma);
  const order = await db.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  const { updateOrderStatus } = await import("@/modules/ecom/order/order.service");
  return updateOrderStatus(orderId, 5);
}

export async function addOrderNotes(orderId: number, notes: string) {
  return await bind(prisma).updateOrderNotes(orderId, notes);
}
