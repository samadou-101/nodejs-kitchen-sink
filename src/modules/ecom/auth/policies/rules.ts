import type { AuthContext } from "../rbac/rbac.types";
import type { RoleName } from "../rbac/rbac.types";

export type Policy = (auth: AuthContext) => boolean;

export interface AuthzContext {
  order?: OrderContext | null;
  product?: ProductContext | null;
  employee?: EmployeeContext | null;
  customer?: CustomerContext | null;
}

export interface OrderContext {
  orderId: number;
  employeeId: number | null;
  customerId: number;
}

export interface ProductContext {
  productId: number;
  categoryId: number;
}

export interface EmployeeContext {
  employeeId: number;
  userId: number;
  isActive: boolean;
}

export interface CustomerContext {
  customerId: number;
  userId: number | null;
}

export const isSuperAdmin = (auth: AuthContext): boolean => auth.isSuperAdmin;

export const isRole = (...roles: RoleName[]) => (auth: AuthContext): boolean =>
  roles.some((r) => auth.roleNames.includes(r));

export const isAdmin = isRole("ADMIN");

export const isEmployee = isRole("EMPLOYEE");

export const checkPermission = (...perms: string[]) => (auth: AuthContext): boolean =>
  perms.every((p) => auth.permissions.includes(p));

export const checkAnyPermission = (...perms: string[]) => (auth: AuthContext): boolean =>
  perms.some((p) => auth.permissions.includes(p));

export const and =
  (...policies: Policy[]) =>
  (auth: AuthContext): boolean =>
    policies.every((p) => p(auth));

export const or =
  (...policies: Policy[]) =>
  (auth: AuthContext): boolean =>
    policies.some((p) => p(auth));

export const not =
  (policy: Policy) =>
  (auth: AuthContext): boolean =>
    !policy(auth);

export const always = () => true;

export const never = () => false;