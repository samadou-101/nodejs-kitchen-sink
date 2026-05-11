import type { AuthContext } from "../../rbac/rbac.types";
import type { Policy } from "../rules";
import { isSuperAdmin, isRole, or } from "../rules";

export const ProductPolicies = {
  create: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  view: (): Policy => or(isSuperAdmin, isRole("ADMIN"), isRole("EMPLOYEE")),

  update: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  delete: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  manageInventory: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  updateInventory: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  viewInventory: (): Policy => or(isSuperAdmin, isRole("ADMIN")),
} as const;

export type ProductPolicyName = keyof typeof ProductPolicies;