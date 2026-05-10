export const RoleName = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const Resource = {
  PRODUCT: "product",
  ORDER: "order",
  INVENTORY: "inventory",
  EMPLOYEE: "employee",
  PAYROLL: "payroll",
  CUSTOMER: "customer",
} as const;

export type Resource = (typeof Resource)[keyof typeof Resource];

export const Action = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  ALL: "*",
} as const;

export type Action = (typeof Action)[keyof typeof Action];

export interface Permission {
  resource: Resource | "*";
  action: Action | "*";
}

export interface AuthContext {
  userId: number;
  employeeId: number | null;
  roleNames: RoleName[];
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string | undefined;
}

export interface PolicyContext extends AuthContext {
  targetUserId?: number;
  targetEmployeeId?: number;
  targetOrderId?: number;
  targetProductId?: number;
}