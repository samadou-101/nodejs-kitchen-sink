import { AbilityBuilder } from '@casl/ability';
import type { AuthContext } from '../rbac/rbac.types';
import { RoleName } from '../rbac/rbac.types';
import type { AppAbility, AppAction, AppSubjects } from './types';
import { AppAbilityConstructor } from './types';

export function buildAbility(auth: AuthContext): AppAbility {
  const { can, build } = new AbilityBuilder(AppAbilityConstructor);

  if (auth.isSuperAdmin) {
    can('manage', 'all');
    return build();
  }

  if (auth.roleNames.includes(RoleName.ADMIN)) {
    can('manage', ['Product', 'Order', 'Inventory', 'Employee', 'Payroll', 'Customer']);
  }

  if (auth.roleNames.includes(RoleName.EMPLOYEE)) {
    can(['read', 'update'], 'Order', { employeeId: auth.employeeId });
    can(['confirm', 'reject'], 'Order', { employeeId: auth.employeeId });
    can('create', 'Order');
    can('read', 'Product');
    can('read', 'Customer');
    can('read', 'Inventory');
    can('viewAssigned', 'Order');
    can('viewOwn', 'Payroll');
  }

  return build();
}

export function buildAbilityFromPermissions(
  roles: string[],
  permissions: string[],
  employeeId: number | null,
): AppAbility {
  const { can, build } = new AbilityBuilder(AppAbilityConstructor);

  if (roles.includes('SUPERADMIN')) {
    can('manage', 'all');
    return build();
  }

  for (const perm of permissions) {
    const sep = perm.indexOf(':');
    const resource = sep === -1 ? perm : perm.slice(0, sep);
    const action = sep === -1 ? 'manage' : perm.slice(sep + 1);

    if (resource === '*' && action === '*') {
      can('manage', 'all');
    } else if (action === '*') {
      can('manage', resource as AppSubjects);
    } else {
      can(action as AppAction, resource as AppSubjects);
    }
  }

  if (employeeId != null) {
    can(['read', 'update', 'confirm', 'reject'], 'Order', { employeeId });
  }

  return build();
}
