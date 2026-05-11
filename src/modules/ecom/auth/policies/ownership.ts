import type { AuthContext } from "../rbac/rbac.types";
import type { OrderContext, EmployeeContext, CustomerContext, ProductContext } from "./rules";

export const isOwner = (auth: AuthContext, resource: { userId?: number | null }): boolean =>
  resource.userId === auth.userId;

export const isSameEmployee = (
  auth: AuthContext,
  resource: { employeeId?: number | null }
): boolean => auth.employeeId !== null && resource.employeeId === auth.employeeId;

export const isOrderOwner = (auth: AuthContext, order: OrderContext | null): boolean =>
  isSameEmployee(auth, order as { employeeId: number | null });

export const isEmployeeSelf = (
  auth: AuthContext,
  employee: EmployeeContext | null
): boolean => employee !== null && employee.userId === auth.userId;

export const isCustomerSelf = (
  auth: AuthContext,
  customer: CustomerContext | null
): boolean => customer !== null && customer.userId === auth.userId;

export const isProductOwner = (
  auth: AuthContext,
  product: ProductContext | null
): boolean => false;