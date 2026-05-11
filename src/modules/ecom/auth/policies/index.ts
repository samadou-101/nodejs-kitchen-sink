export {
  isSuperAdmin,
  isRole,
  isAdmin,
  isEmployee,
  and,
  or,
  not,
  always,
  never,
} from "./rules";

export type { Policy, AuthzContext, OrderContext, ProductContext, EmployeeContext, CustomerContext } from "./rules";

export { isOwner, isSameEmployee, isOrderOwner, isEmployeeSelf, isCustomerSelf } from "./ownership";

export { OrderPolicies } from "./resources/order.policy";
export type { OrderPolicyName } from "./resources/order.policy";

export { ProductPolicies } from "./resources/product.policy";
export type { ProductPolicyName } from "./resources/product.policy";

export { EmployeePolicies } from "./resources/employee.policy";
export type { EmployeePolicyName } from "./resources/employee.policy";

export { CustomerPolicies } from "./resources/customer.policy";
export type { CustomerPolicyName } from "./resources/customer.policy";

export { PayrollPolicies } from "./resources/payroll.policy";
export type { PayrollPolicyName } from "./resources/payroll.policy";