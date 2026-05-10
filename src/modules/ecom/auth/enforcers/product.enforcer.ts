import type { AuthorizationResult, AuthContext } from "../rbac/rbac.types";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  canViewProduct,
  canCreateProduct,
  canUpdateProduct,
  canDeleteProduct,
  canManageInventory,
  canUpdateInventory,
  canViewInventory,
} from "../policies/product.policy";

type DbClient = PrismaClient | Prisma.TransactionClient;

interface ProductData {
  productId: number;
  categoryId: number;
}

export async function enforceViewProduct(
  ctx: AuthContext,
  _tx: DbClient,
  productId: number,
): Promise<AuthorizationResult> {
  const allowed = canViewProduct(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to view this product" };
}

export function enforceCreateProduct(ctx: AuthContext): AuthorizationResult {
  const allowed = canCreateProduct(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to create products" };
}

export async function enforceUpdateProduct(
  ctx: AuthContext,
  tx: DbClient,
  productId: number,
): Promise<AuthorizationResult> {
  const product = await tx.product.findUnique({
    where: { productId },
    select: { productId: true, categoryId: true },
  });

  if (!product) {
    return { allowed: false, reason: "Product not found" };
  }

  const allowed = canUpdateProduct(ctx, product);
  return { allowed, reason: allowed ? undefined : "Not authorized to update this product" };
}

export async function enforceDeleteProduct(
  ctx: AuthContext,
  tx: DbClient,
  productId: number,
): Promise<AuthorizationResult> {
  const product = await tx.product.findUnique({
    where: { productId },
    select: { productId: true, categoryId: true },
  });

  if (!product) {
    return { allowed: false, reason: "Product not found" };
  }

  const allowed = canDeleteProduct(ctx, product);
  return { allowed, reason: allowed ? undefined : "Not authorized to delete this product" };
}

export function enforceManageInventory(ctx: AuthContext): AuthorizationResult {
  const allowed = canManageInventory(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to manage inventory" };
}

export function enforceUpdateInventory(ctx: AuthContext): AuthorizationResult {
  const allowed = canUpdateInventory(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to update inventory" };
}

export function enforceViewInventory(ctx: AuthContext): AuthorizationResult {
  const allowed = canViewInventory(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to view inventory" };
}