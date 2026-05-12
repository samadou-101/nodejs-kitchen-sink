import { Ability } from '@casl/ability';
import type { AbilityClass } from '@casl/ability';

export const AppActions = [
  'create', 'read', 'update', 'delete', 'manage',
  'confirm', 'reject', 'cancel', 'assign',
  'view', 'viewAll', 'viewAssigned', 'viewOwn',
  'manageInventory', 'updateInventory', 'viewInventory',
  'deactivate', 'viewPerformance', 'managePayment',
  'finalize', 'viewItem', 'updateItem',
] as const;

export type AppAction = (typeof AppActions)[number];

export type AppSubjects =
  | 'Order'
  | 'Product'
  | 'Employee'
  | 'Customer'
  | 'Payroll'
  | 'Inventory'
  | 'all';

export interface OrderSubject {
  employeeId: number | null;
  customerId: number;
}

export interface ProductSubject {
  categoryId: number;
}

export interface EmployeeSubject {
  employeeId: number;
  userId: number;
  isActive: boolean;
}

export interface CustomerSubject {
  userId: number | null;
}

export interface PayrollSubject {
  employeeId: number;
}

export type AppSubject =
  | AppSubjects
  | OrderSubject
  | ProductSubject
  | EmployeeSubject
  | CustomerSubject
  | PayrollSubject
  | Record<string, unknown>;

export type AppAbility = Ability<[AppAction, AppSubject]>;
export const AppAbilityConstructor = Ability as AbilityClass<AppAbility>;
