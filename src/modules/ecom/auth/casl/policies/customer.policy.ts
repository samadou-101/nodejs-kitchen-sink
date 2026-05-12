import type { AppAbility } from '../types';

type CustomerData = { userId: number | null };

function tag(type: string, data: Record<string, unknown>) {
  return { ...data, __caslSubjectType__: type };
}

export const CustomerCaslPolicies = {
  create: (ability: AppAbility) => ability.can('create', 'Customer'),

  view: (ability: AppAbility, customer?: CustomerData) =>
    customer ? ability.can('read', tag('Customer', customer)) : ability.can('read', 'Customer'),

  update: (ability: AppAbility) => ability.can('update', 'Customer'),

  delete: (ability: AppAbility) => ability.can('delete', 'Customer'),
} as const;

export type CustomerCaslPolicyName = keyof typeof CustomerCaslPolicies;
