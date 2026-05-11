import type { AuthContext } from "../../rbac/rbac.types";
import type { Policy } from "../rules";
import { isSuperAdmin, isRole, or, and } from "../rules";
import type { OrderContext } from "../rules";
import { isSameEmployee } from "../ownership";

export const OrderPolicies = {
  create: (): Policy => or(isSuperAdmin, isRole("ADMIN"), isRole("EMPLOYEE")),

  view: (order: OrderContext): Policy =>
    or(
      isSuperAdmin,
      isRole("ADMIN"),
      and(
        isRole("EMPLOYEE"),
        (auth) => isSameEmployee(auth, order),
      ),
    ),

  update: (order: OrderContext): Policy =>
    or(
      isSuperAdmin,
      isRole("ADMIN"),
      and(
        isRole("EMPLOYEE"),
        (auth) => isSameEmployee(auth, order),
      ),
    ),

  delete: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  assign: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  confirm: (order: OrderContext): Policy =>
    or(
      isSuperAdmin,
      isRole("ADMIN"),
      and(
        isRole("EMPLOYEE"),
        (auth) => isSameEmployee(auth, order),
      ),
    ),

  reject: (order: OrderContext): Policy =>
    or(
      isSuperAdmin,
      isRole("ADMIN"),
      and(
        isRole("EMPLOYEE"),
        (auth) => isSameEmployee(auth, order),
      ),
    ),

  cancel: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  viewAll: (): Policy => or(isSuperAdmin, isRole("ADMIN")),

  viewAssigned: (): Policy => or(isSuperAdmin, isRole("ADMIN"), isRole("EMPLOYEE")),
} as const;

export type OrderPolicyName = keyof typeof OrderPolicies;