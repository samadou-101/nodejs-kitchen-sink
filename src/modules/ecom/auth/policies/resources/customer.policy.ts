import type { AuthContext } from "../../rbac/rbac.types";
import type { Policy } from "../rules";
import { isSuperAdmin, isRole, or } from "../rules";
import type { CustomerContext } from "../rules";

export const CustomerPolicies = {
  create: (): Policy => or(isSuperAdmin, isRole("ADMIN"), isRole("EMPLOYEE")),

  view: (customer: CustomerContext): Policy =>
    or(isSuperAdmin, isRole("ADMIN"), isRole("EMPLOYEE")),

  update: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  delete: (): Policy => or(isSuperAdmin, isRole("ADMIN")),
} as const;

export type CustomerPolicyName = keyof typeof CustomerPolicies;