import type { Request } from "express";
import { redisClient } from "@/config/redis.config";
import { prisma } from "@/config/db.config";
import type { AuthContext, RoleName } from "./rbac.types";
import { RoleName as RoleEnum } from "./rbac.types";
import { getUserRolePermissions, getEmployeeIdByUserId } from "./rbac.repo";
import { resolvePermissions } from "./rbac.matcher";

const AUTH_CACHE_TTL = 60 * 15;

export interface CachedAuthData {
  roles: RoleName[];
  permissions: string[];
  employeeId: number | null;
}

export async function resolveAuthContext(
  userId: number,
  useCache = true,
): Promise<AuthContext> {
  if (useCache) {
    const cached = await getCachedAuthData(userId);
    if (cached) {
      return buildAuthContext(userId, cached);
    }
  }

  const { roles, permissions } = await getUserRolePermissions(prisma, userId);
  const employeeId = await getEmployeeIdByUserId(prisma, userId);

  const authData: CachedAuthData = { roles, permissions, employeeId };
  await cacheAuthData(userId, authData);

  return buildAuthContext(userId, authData);
}

function buildAuthContext(
  userId: number,
  data: CachedAuthData,
): AuthContext {
  return {
    userId,
    employeeId: data.employeeId,
    roleNames: data.roles,
    permissions: resolvePermissions(data.permissions),
    isSuperAdmin: data.roles.includes(RoleEnum.SUPERADMIN),
  };
}

async function getCachedAuthData(
  userId: number,
): Promise<CachedAuthData | null> {
  const key = `auth:user:${userId}`;
  const cached = await redisClient.get(key);
  if (!cached) return null;

  try {
    return JSON.parse(cached) as CachedAuthData;
  } catch {
    return null;
  }
}

async function cacheAuthData(
  userId: number,
  data: CachedAuthData,
): Promise<void> {
  const key = `auth:user:${userId}`;
  await redisClient.set(key, JSON.stringify(data), {
    expiration: { type: "EX", value: AUTH_CACHE_TTL },
  });
}

export async function invalidateAuthCache(userId: number): Promise<void> {
  const key = `auth:user:${userId}`;
  await redisClient.del(key);
}

export async function invalidateAuthCacheByRole(roleName: RoleName): Promise<void> {
  const usersWithRole = await prisma.userRole.findMany({
    where: { role: { name: roleName } },
    select: { userId: true },
  });

  await Promise.all(
    usersWithRole.map((ur) => invalidateAuthCache(ur.userId))
  );
}

export function getAuthContext(req: Request): AuthContext | undefined {
  return req.auth;
}