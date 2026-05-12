import type { AppAbility } from '../types';

type EmployeeData = { employeeId: number; userId: number; isActive: boolean };

function tag(type: string, data: Record<string, unknown>) {
  return { ...data, __caslSubjectType__: type };
}

export const EmployeeCaslPolicies = {
  create: (ability: AppAbility) => ability.can('create', 'Employee'),

  view: (ability: AppAbility, employee?: EmployeeData) =>
    employee ? ability.can('read', tag('Employee', employee)) : ability.can('read', 'Employee'),

  update: (ability: AppAbility) => ability.can('update', 'Employee'),

  delete: (ability: AppAbility) => ability.can('delete', 'Employee'),

  deactivate: (ability: AppAbility) => ability.can('deactivate', 'Employee'),

  viewPerformance: (ability: AppAbility) => ability.can('viewPerformance', 'Employee'),

  managePayment: (ability: AppAbility) => ability.can('managePayment', 'Employee'),
} as const;

export type EmployeeCaslPolicyName = keyof typeof EmployeeCaslPolicies;
