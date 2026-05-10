import type { AuthorizationResult, AuthContext } from "../rbac/rbac.types";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  canViewPayroll,
  canCreatePayroll,
  canConfirmPayroll,
  canFinalizePayroll,
  canViewPayrollItem,
  canUpdatePayrollItem,
} from "../policies/payroll.policy";

type DbClient = PrismaClient | Prisma.TransactionClient;

export function enforceViewPayroll(ctx: AuthContext): AuthorizationResult {
  const allowed = canViewPayroll(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to view payroll" };
}

export function enforceCreatePayroll(ctx: AuthContext): AuthorizationResult {
  const allowed = canCreatePayroll(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to create payroll" };
}

export async function enforceConfirmPayroll(
  ctx: AuthContext,
  tx: DbClient,
  payrollRunId: number,
): Promise<AuthorizationResult> {
  const run = await tx.payrollRun.findUnique({
    where: { payrollRunId },
    select: { payrollRunId: true, status: true },
  });

  if (!run) {
    return { allowed: false, reason: "Payroll run not found" };
  }

  const allowed = canConfirmPayroll(ctx, run);
  return { allowed, reason: allowed ? undefined : "Not authorized to confirm this payroll" };
}

export async function enforceFinalizePayroll(
  ctx: AuthContext,
  tx: DbClient,
  payrollRunId: number,
): Promise<AuthorizationResult> {
  const run = await tx.payrollRun.findUnique({
    where: { payrollRunId },
    select: { payrollRunId: true, status: true },
  });

  if (!run) {
    return { allowed: false, reason: "Payroll run not found" };
  }

  const allowed = canFinalizePayroll(ctx, run);
  return { allowed, reason: allowed ? undefined : "Not authorized to finalize this payroll" };
}

export async function enforceViewPayrollItem(
  ctx: AuthContext,
  tx: DbClient,
  payrollRunItemId: number,
): Promise<AuthorizationResult> {
  const item = await tx.payrollRunItem.findUnique({
    where: { payrollRunItemId },
    select: { payrollRunItemId: true, employeeId: true },
  });

  if (!item) {
    return { allowed: false, reason: "Payroll run item not found" };
  }

  const allowed = canViewPayrollItem(ctx, item);
  return { allowed, reason: allowed ? undefined : "Not authorized to view this payroll item" };
}

export async function enforceUpdatePayrollItem(
  ctx: AuthContext,
  tx: DbClient,
  payrollRunItemId: number,
): Promise<AuthorizationResult> {
  const item = await tx.payrollRunItem.findUnique({
    where: { payrollRunItemId },
    select: { payrollRunItemId: true, employeeId: true },
  });

  if (!item) {
    return { allowed: false, reason: "Payroll run item not found" };
  }

  const allowed = canUpdatePayrollItem(ctx, item);
  return { allowed, reason: allowed ? undefined : "Not authorized to update this payroll item" };
}