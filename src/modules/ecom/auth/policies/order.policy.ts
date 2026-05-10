import type { AuthContext } from "../rbac/rbac.types";

interface Order {
  orderId: number;
  employeeId: number | null;
  customerId: number;
}

export function canViewOrder(ctx: AuthContext, order: Order): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (ctx.roleNames.includes("EMPLOYEE") && order.employeeId === ctx.employeeId) {
    return true;
  }
  return false;
}

export function canUpdateOrder(ctx: AuthContext, order: Order): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (ctx.roleNames.includes("EMPLOYEE") && order.employeeId === ctx.employeeId) {
    return true;
  }
  return false;
}

export function canConfirmOrder(ctx: AuthContext, order: Order): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (ctx.roleNames.includes("EMPLOYEE")) {
    return order.employeeId === ctx.employeeId;
  }
  return false;
}

export function canCancelOrder(ctx: AuthContext, order: Order): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canAssignOrder(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canViewAllOrders(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canViewAssignedOrders(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (ctx.roleNames.includes("EMPLOYEE")) return true;
  return false;
}

export function canCreateOrder(ctx: AuthContext): boolean {
  return true;
}

export function canDeleteOrder(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}