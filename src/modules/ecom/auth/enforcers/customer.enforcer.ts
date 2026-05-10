import type { AuthorizationResult, AuthContext } from "../rbac/rbac.types";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  canViewCustomer,
  canUpdateCustomer,
  canDeleteCustomer,
  canCreateCustomer,
} from "../policies/customer.policy";

type DbClient = PrismaClient | Prisma.TransactionClient;

interface CustomerData {
  customerId: number;
  userId: number | null;
}

export async function enforceViewCustomer(
  ctx: AuthContext,
  tx: DbClient,
  customerId: number,
): Promise<AuthorizationResult> {
  const customer = await tx.customer.findUnique({
    where: { customerId },
    select: { customerId: true, userId: true },
  });

  if (!customer) {
    return { allowed: false, reason: "Customer not found" };
  }

  const allowed = canViewCustomer(ctx, customer);
  return { allowed, reason: allowed ? undefined : "Not authorized to view this customer" };
}

export async function enforceUpdateCustomer(
  ctx: AuthContext,
  tx: DbClient,
  customerId: number,
): Promise<AuthorizationResult> {
  const customer = await tx.customer.findUnique({
    where: { customerId },
    select: { customerId: true, userId: true },
  });

  if (!customer) {
    return { allowed: false, reason: "Customer not found" };
  }

  const allowed = canUpdateCustomer(ctx, customer);
  return { allowed, reason: allowed ? undefined : "Not authorized to update this customer" };
}

export async function enforceDeleteCustomer(
  ctx: AuthContext,
  tx: DbClient,
  customerId: number,
): Promise<AuthorizationResult> {
  const customer = await tx.customer.findUnique({
    where: { customerId },
    select: { customerId: true, userId: true },
  });

  if (!customer) {
    return { allowed: false, reason: "Customer not found" };
  }

  const allowed = canDeleteCustomer(ctx, customer);
  return { allowed, reason: allowed ? undefined : "Not authorized to delete this customer" };
}

export function enforceCreateCustomer(ctx: AuthContext): AuthorizationResult {
  const allowed = canCreateCustomer(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to create customers" };
}