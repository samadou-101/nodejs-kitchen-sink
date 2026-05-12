import type { AppAbility, AppAction, AppSubjects } from './types';
import { ForbiddenError } from '../errors';

export function authorizeCasl(
  ability: AppAbility,
  action: AppAction,
  resource: AppSubjects,
): void {
  if (!ability.can(action, resource)) {
    throw new ForbiddenError(`Cannot ${action} ${resource}`);
  }
}

export function authorizeCaslWithSubject(
  ability: AppAbility,
  action: AppAction,
  type: string,
  data: Record<string, unknown>,
): void {
  const target = { ...data, __caslSubjectType__: type };
  if (!ability.can(action, target)) {
    throw new ForbiddenError(`Cannot ${action} ${type}`);
  }
}
