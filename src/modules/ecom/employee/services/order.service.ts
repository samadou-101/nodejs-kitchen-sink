import { prisma } from "@/config/db.config";
import { bind } from "../repo/order.repo";
import {
  enforceViewAssignedOrders,
  enforceUpdateOrder,
  enforceViewOrder,
  enforceConfirmOrder,
  enforceRejectOrder,
} from "@/modules/ecom/auth";
import { assertAuth, checkAuthz } from "@/modules/ecom/auth/errors";
import { updateOrderStatus } from "@/modules/ecom/order/order.service";

export async function getAssignedOrders(employeeId: number, auth: unknown) {
  assertAuth(auth);
  const result = enforceViewAssignedOrders(auth);
  checkAuthz(result);
  return await bind(prisma).findAssignedOrders(employeeId);
}

export async function getOrderById(orderId: number, auth: unknown) {
  assertAuth(auth);
  const result = await enforceViewOrder(auth, prisma, orderId);
  checkAuthz(result);
  return await bind(prisma).findOrderById(orderId);
}

export async function confirmOrder(orderId: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const result = await enforceConfirmOrder(auth, tx, orderId);
    checkAuthz(result);

    const order = await bind(tx).findOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

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
    const result = await enforceRejectOrder(auth, tx, orderId);
    checkAuthz(result);

    const order = await bind(tx).findOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    return updateOrderStatus(orderId, 5, auth);
  });
}

export async function addOrderNotes(
  orderId: number,
  notes: string,
  auth: unknown,
) {
  assertAuth(auth);
  const result = await enforceUpdateOrder(auth, prisma, orderId);
  checkAuthz(result);
  const db = bind(prisma);
  return await db.updateOrderNotes(orderId, notes);
}
