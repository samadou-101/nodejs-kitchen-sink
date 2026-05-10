export function matchesPermission(
  required: string,
  granted: string,
): boolean {
  if (granted === "*") return true;

  if (granted.endsWith(":*")) {
    const resource = granted.slice(0, -2);
    const [reqResource] = required.split(":");
    return resource === reqResource;
  }

  return required === granted;
}

export function resolvePermissions(permissions: string[]): string[] {
  const resolved: string[] = [];

  for (const perm of permissions) {
    if (perm === "*") {
      resolved.push("*");
      continue;
    }

    if (perm.endsWith(":*")) {
      const resource = perm.slice(0, -2);
      resolved.push(`${resource}:create`);
      resolved.push(`${resource}:read`);
      resolved.push(`${resource}:update`);
      resolved.push(`${resource}:delete`);
      continue;
    }

    resolved.push(perm);
  }

  return resolved;
}

export function hasPermission(
  permissions: string[],
  required: string,
): boolean {
  const resolved = resolvePermissions(permissions);
  return resolved.some((p) => matchesPermission(required, p));
}

export function hasAnyPermission(
  permissions: string[],
  required: string[],
): boolean {
  return required.some((r) => hasPermission(permissions, r));
}

export function hasAllPermissions(
  permissions: string[],
  required: string[],
): boolean {
  return required.every((r) => hasPermission(permissions, r));
}

export function hasWildcard(resource: string, permissions: string[]): boolean {
  return hasPermission(permissions, `${resource}:*`);
}

export function parsePermissionString(permission: string): { resource: string; action: string } {
  const parts = permission.split(":");
  return { resource: parts[0] ?? "", action: parts[1] ?? "*" };
}