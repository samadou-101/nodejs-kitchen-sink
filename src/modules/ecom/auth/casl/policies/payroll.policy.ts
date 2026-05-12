import type { AppAbility } from '../types';

export const PayrollCaslPolicies = {
  view: (ability: AppAbility) => ability.can('view', 'Payroll'),

  create: (ability: AppAbility) => ability.can('create', 'Payroll'),

  update: (ability: AppAbility) => ability.can('update', 'Payroll'),

  viewOwn: (ability: AppAbility) => ability.can('viewOwn', 'Payroll'),

  confirm: (ability: AppAbility) => ability.can('confirm', 'Payroll'),

  finalize: (ability: AppAbility) => ability.can('finalize', 'Payroll'),

  viewItem: (ability: AppAbility) => ability.can('viewItem', 'Payroll'),

  updateItem: (ability: AppAbility) => ability.can('updateItem', 'Payroll'),
} as const;

export type PayrollCaslPolicyName = keyof typeof PayrollCaslPolicies;
