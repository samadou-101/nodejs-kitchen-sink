import type { AppAbility } from '../types';

export const ProductCaslPolicies = {
  create: (ability: AppAbility) => ability.can('create', 'Product'),

  view: (ability: AppAbility) => ability.can('read', 'Product'),

  update: (ability: AppAbility) => ability.can('update', 'Product'),

  delete: (ability: AppAbility) => ability.can('delete', 'Product'),

  manageInventory: (ability: AppAbility) => ability.can('manageInventory', 'Product'),

  updateInventory: (ability: AppAbility) => ability.can('updateInventory', 'Product'),

  viewInventory: (ability: AppAbility) => ability.can('viewInventory', 'Product'),
} as const;

export type ProductCaslPolicyName = keyof typeof ProductCaslPolicies;
