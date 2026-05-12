import type { AppAbility } from '../types';

type OrderData = { employeeId: number | null; customerId: number };

function tag(type: string, data: Record<string, unknown>) {
  return { ...data, __caslSubjectType__: type };
}

export const OrderCaslPolicies = {
  create: (ability: AppAbility) => ability.can('create', 'Order'),

  view: (ability: AppAbility, order?: OrderData) =>
    order ? ability.can('read', tag('Order', order)) : ability.can('read', 'Order'),

  update: (ability: AppAbility, order?: OrderData) =>
    order ? ability.can('update', tag('Order', order)) : ability.can('update', 'Order'),

  delete: (ability: AppAbility) => ability.can('delete', 'Order'),

  assign: (ability: AppAbility) => ability.can('assign', 'Order'),

  confirm: (ability: AppAbility, order: OrderData) =>
    ability.can('confirm', tag('Order', order)),

  reject: (ability: AppAbility, order: OrderData) =>
    ability.can('reject', tag('Order', order)),

  cancel: (ability: AppAbility) => ability.can('cancel', 'Order'),

  viewAll: (ability: AppAbility) => ability.can('viewAll', 'Order'),

  viewAssigned: (ability: AppAbility) => ability.can('viewAssigned', 'Order'),
} as const;

export type OrderCaslPolicyName = keyof typeof OrderCaslPolicies;
