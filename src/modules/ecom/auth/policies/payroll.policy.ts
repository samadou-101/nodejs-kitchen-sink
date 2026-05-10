import type { AuthContext } from "../rbac/rbac.types";

interface PayrollRun {
  payrollRunId: number;
  status: string;
}

interface PayrollRunItem {
  employeeId: number;
}

export function canViewPayroll(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canCreatePayroll(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canConfirmPayroll(
  ctx: AuthContext,
  payrollRun: PayrollRun,
): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canFinalizePayroll(
  ctx: AuthContext,
  payrollRun: PayrollRun,
): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canViewPayrollItem(
  ctx: AuthContext,
  item: PayrollRunItem,
): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (
    ctx.roleNames.includes("EMPLOYEE") &&
    item.employeeId === ctx.employeeId
  ) {
    return true;
  }
  return false;
}

export function canUpdatePayrollItem(
  ctx: AuthContext,
  item: PayrollRunItem,
): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}
