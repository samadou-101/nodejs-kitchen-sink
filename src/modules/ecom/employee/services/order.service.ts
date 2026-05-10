import { prisma } from "@/config/db.config";
import { bind } from "../repo/order.repo";

export async function getAssignedOrders(employeeId: number) {
  return await bind(prisma).findAssignedOrders(employeeId);
}

export async function getOrderById(orderId: number) {
  return await bind(prisma).findOrderById(orderId);
}

export async function confirmOrder(orderId: number, auth: unknown) {
  const db = bind(prisma);
  const order = await db.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.orderStatusId === 1) {
    const { updateOrderStatus } = await import("@/modules/ecom/order/order.service");
    return updateOrderStatus(orderId, 2, auth);
  }
  return order;
}

export async function rejectOrder(orderId: number, auth: unknown) {
  const db = bind(prisma);
  const order = await db.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  const { updateOrderStatus } = await import("@/modules/ecom/order/order.service");
  return updateOrderStatus(orderId, 5, auth);
}

export async function addOrderNotes(orderId: number, notes: string, auth: unknown) {
  const db = bind(prisma);
  return await db.updateOrderNotes(orderId, notes);
}