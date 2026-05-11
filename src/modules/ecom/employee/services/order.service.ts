import { prisma } from "@/config/db.config";
import { bind } from "../repo/order.repo";
import { authorize } from "@/modules/ecom/auth";
import { OrderPolicies } from "@/modules/ecom/auth/policies";
import { assertAuth } from "@/modules/ecom/auth/errors";
import { updateOrderStatus } from "@/modules/ecom/order/order.service";

export async function getAssignedOrders(employeeId: number, auth: unknown) {
  assertAuth(auth);
  authorize(auth, OrderPolicies.viewAssigned());
  return await bind(prisma).findAssignedOrders(employeeId);
}

export async function getOrderById(orderId: number, auth: unknown) {
  assertAuth(auth);

  const order = await bind(prisma).findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  authorize(auth, OrderPolicies.view(order));
  return order;
}

export async function confirmOrder(orderId: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const order = await bind(tx).findOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    authorize(auth, OrderPolicies.confirm(order));

    if (order.orderStatusId !== 1) {
      // Already confirmed or beyond — return current state
      return order;
    }

    return updateOrderStatus(orderId, 2, auth);
  });
}

export async function rejectOrder(orderId: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const order = await bind(tx).findOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    authorize(auth, OrderPolicies.reject(order));

    return updateOrderStatus(orderId, 5, auth);
  });
}

export async function addOrderNotes(
  orderId: number,
  notes: string,
  auth: unknown,
) {
  assertAuth(auth);

  const order = await bind(prisma).findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  authorize(auth, OrderPolicies.update(order));

  const db = bind(prisma);
  return await db.updateOrderNotes(orderId, notes);
}