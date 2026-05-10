import type { AuthorizationResult, AuthContext } from "../rbac/rbac.types";
import type { Prisma } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  canViewOrder,
  canUpdateOrder,
  canConfirmOrder,
  canCancelOrder,
  canAssignOrder,
  canViewAllOrders,
  canViewAssignedOrders,
  canCreateOrder,
  canDeleteOrder,
} from "../policies/order.policy";

interface OrderData {
  orderId: number;
  employeeId: number | null;
  customerId: number;
}

export async function enforceViewOrder(
  ctx: AuthContext,
  tx: PrismaClient | Prisma.TransactionClient,
  orderId: number,
): Promise<AuthorizationResult> {
  const order = await tx.order.findUnique({
    where: { orderId },
    select: { orderId: true, employeeId: true, customerId: true },
  });

  if (!order) {
    return { allowed: false, reason: "Order not found" };
  }

  const allowed = canViewOrder(ctx, order);
  return { allowed, reason: allowed ? undefined : "Not authorized to view this order" };
}

export async function enforceUpdateOrder(
  ctx: AuthContext,
  tx: PrismaClient | Prisma.TransactionClient,
  orderId: number,
): Promise<AuthorizationResult> {
  const order = await tx.order.findUnique({
    where: { orderId },
    select: { orderId: true, employeeId: true, customerId: true },
  });

  if (!order) {
    return { allowed: false, reason: "Order not found" };
  }

  const allowed = canUpdateOrder(ctx, order);
  return { allowed, reason: allowed ? undefined : "Not authorized to update this order" };
}

export async function enforceConfirmOrder(
  ctx: AuthContext,
  tx: PrismaClient | Prisma.TransactionClient,
  orderId: number,
): Promise<AuthorizationResult> {
  const order = await tx.order.findUnique({
    where: { orderId },
    select: { orderId: true, employeeId: true, customerId: true },
  });

  if (!order) {
    return { allowed: false, reason: "Order not found" };
  }

  const allowed = canConfirmOrder(ctx, order);
  return { allowed, reason: allowed ? undefined : "Not authorized to confirm this order" };
}

export async function enforceCancelOrder(
  ctx: AuthContext,
  tx: PrismaClient | Prisma.TransactionClient,
  orderId: number,
): Promise<AuthorizationResult> {
  const order = await tx.order.findUnique({
    where: { orderId },
    select: { orderId: true, employeeId: true, customerId: true },
  });

  if (!order) {
    return { allowed: false, reason: "Order not found" };
  }

  const allowed = canCancelOrder(ctx, order);
  return { allowed, reason: allowed ? undefined : "Not authorized to cancel this order" };
}

export function enforceAssignOrder(ctx: AuthContext): AuthorizationResult {
  const allowed = canAssignOrder(ctx, { orderId: 0, employeeId: null, customerId: 0 });
  return { allowed, reason: allowed ? undefined : "Not authorized to assign this order" };
}

export function enforceViewAllOrders(ctx: AuthContext): AuthorizationResult {
  const allowed = canViewAllOrders(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to view all orders" };
}

export function enforceViewAssignedOrders(ctx: AuthContext): AuthorizationResult {
  const allowed = canViewAssignedOrders(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to view assigned orders" };
}

export function enforceCreateOrder(ctx: AuthContext): AuthorizationResult {
  const allowed = canCreateOrder(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to create orders" };
}

export function enforceDeleteOrder(ctx: AuthContext): AuthorizationResult {
  const allowed = canDeleteOrder(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to delete orders" };
}