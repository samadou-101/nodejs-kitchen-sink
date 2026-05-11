import type { AuthContext } from "../../rbac/rbac.types";
import type { Policy } from "../rules";
import { isSuperAdmin, isRole, or } from "../rules";

export const PayrollPolicies = {
  view: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  create: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  update: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  viewOwn: (): Policy => or(isSuperAdmin, isRole("ADMIN"), isRole("EMPLOYEE")),

  confirm: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  finalize: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  viewItem: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  updateItem: (): Policy => or(isSuperAdmin, isRole("ADMIN")),
} as const;

export type PayrollPolicyName = keyof typeof PayrollPolicies;