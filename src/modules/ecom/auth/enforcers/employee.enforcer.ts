import type { AuthorizationResult, AuthContext } from "../rbac/rbac.types";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  canViewEmployee,
  canUpdateEmployee,
  canDeleteEmployee,
  canCreateEmployee,
  canDeactivateEmployee,
  canViewEmployeePerformance,
  canManageEmployeePayment,
} from "../policies/employee.policy";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function enforceViewEmployee(
  ctx: AuthContext,
  tx: DbClient,
  employeeId: number,
): Promise<AuthorizationResult> {
  const employee = await tx.employee.findUnique({
    where: { employeeId },
    select: { employeeId: true, userId: true, isActive: true },
  });

  if (!employee) {
    return { allowed: false, reason: "Employee not found" };
  }

  const allowed = canViewEmployee(ctx, employee);
  return { allowed, reason: allowed ? undefined : "Not authorized to view this employee" };
}

export async function enforceUpdateEmployee(
  ctx: AuthContext,
  tx: DbClient,
  employeeId: number,
): Promise<AuthorizationResult> {
  const employee = await tx.employee.findUnique({
    where: { employeeId },
    select: { employeeId: true, userId: true, isActive: true },
  });

  if (!employee) {
    return { allowed: false, reason: "Employee not found" };
  }

  const allowed = canUpdateEmployee(ctx, employee);
  return { allowed, reason: allowed ? undefined : "Not authorized to update this employee" };
}

export async function enforceDeleteEmployee(
  ctx: AuthContext,
  tx: DbClient,
  employeeId: number,
): Promise<AuthorizationResult> {
  const employee = await tx.employee.findUnique({
    where: { employeeId },
    select: { employeeId: true, userId: true, isActive: true },
  });

  if (!employee) {
    return { allowed: false, reason: "Employee not found" };
  }

  const allowed = canDeleteEmployee(ctx, employee);
  return { allowed, reason: allowed ? undefined : "Not authorized to delete this employee" };
}

export function enforceCreateEmployee(ctx: AuthContext): AuthorizationResult {
  const allowed = canCreateEmployee(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to create employees" };
}

export async function enforceDeactivateEmployee(
  ctx: AuthContext,
  tx: DbClient,
  employeeId: number,
): Promise<AuthorizationResult> {
  const employee = await tx.employee.findUnique({
    where: { employeeId },
    select: { employeeId: true, userId: true, isActive: true },
  });

  if (!employee) {
    return { allowed: false, reason: "Employee not found" };
  }

  const allowed = canDeactivateEmployee(ctx, employee);
  return { allowed, reason: allowed ? undefined : "Not authorized to deactivate this employee" };
}

export function enforceViewEmployeePerformance(ctx: AuthContext): AuthorizationResult {
  const allowed = canViewEmployeePerformance(ctx);
  return { allowed, reason: allowed ? undefined : "Not authorized to view employee performance" };
}

export async function enforceManageEmployeePayment(
  ctx: AuthContext,
  tx: DbClient,
  employeeId: number,
): Promise<AuthorizationResult> {
  const employee = await tx.employee.findUnique({
    where: { employeeId },
    select: { employeeId: true, userId: true, isActive: true },
  });

  if (!employee) {
    return { allowed: false, reason: "Employee not found" };
  }

  const allowed = canManageEmployeePayment(ctx, employee);
  return { allowed, reason: allowed ? undefined : "Not authorized to manage employee payment" };
}