import type { AuthContext } from "../rbac/rbac.types";

interface Product {
  productId: number;
  categoryId: number;
}

export function canViewProduct(ctx: AuthContext): boolean {
  return true;
}

export function canCreateProduct(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canUpdateProduct(ctx: AuthContext, product: Product): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canDeleteProduct(ctx: AuthContext, product: Product): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canManageInventory(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canUpdateInventory(ctx: AuthContext): boolean {
  return canManageInventory(ctx);
}

export function canViewInventory(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}