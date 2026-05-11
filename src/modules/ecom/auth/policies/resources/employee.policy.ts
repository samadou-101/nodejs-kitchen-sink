import type { AuthContext } from "../../rbac/rbac.types";
import type { Policy } from "../rules";
import { isSuperAdmin, isRole, or, and } from "../rules";
import type { EmployeeContext } from "../rules";
import { isEmployeeSelf } from "../ownership";

export const EmployeePolicies = {
  create: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  view: (employee: EmployeeContext): Policy =>
    or(
      isSuperAdmin,
      isRole("ADMIN"),
      and(isRole("EMPLOYEE"), (auth) => isEmployeeSelf(auth, employee))
    ),

  update: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  delete: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  deactivate: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  viewPerformance: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  managePayment: (employee: EmployeeContext): Policy => or(isSuperAdmin, isRole("ADMIN")),
} as const;

export type EmployeePolicyName = keyof typeof EmployeePolicies;