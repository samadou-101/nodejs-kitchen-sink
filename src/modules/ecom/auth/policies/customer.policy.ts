import type { AuthContext } from "../rbac/rbac.types";

interface Customer {
  customerId: number;
  userId: number | null;
}

export function canViewCustomer(ctx: AuthContext, customer: Customer): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (ctx.roleNames.includes("EMPLOYEE")) return true;
  return false;
}

export function canUpdateCustomer(ctx: AuthContext, customer: Customer): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canDeleteCustomer(ctx: AuthContext, customer: Customer): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canCreateCustomer(ctx: AuthContext): boolean {
  return true;
}