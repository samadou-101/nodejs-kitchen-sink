import type { AuthContext } from "../rbac/rbac.types";

interface Employee {
  employeeId: number;
  userId: number;
  isActive: boolean;
}

export function canViewEmployee(ctx: AuthContext, employee: Employee): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  if (ctx.roleNames.includes("EMPLOYEE") && employee.userId === ctx.userId) {
    return true;
  }
  return false;
}

export function canUpdateEmployee(ctx: AuthContext, employee: Employee): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canDeleteEmployee(ctx: AuthContext, employee: Employee): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canCreateEmployee(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canDeactivateEmployee(ctx: AuthContext, employee: Employee): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canViewEmployeePerformance(ctx: AuthContext): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}

export function canManageEmployeePayment(ctx: AuthContext, employee: Employee): boolean {
  if (ctx.isSuperAdmin) return true;
  if (ctx.roleNames.includes("ADMIN")) return true;
  return false;
}