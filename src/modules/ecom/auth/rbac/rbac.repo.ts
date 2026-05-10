import { prisma } from "@/config/db.config";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { RoleName } from "./rbac.types";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function getUserRoles(
  tx: DbClient,
  userId: number,
): Promise<RoleName[]> {
  const userRoles = await tx.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  return userRoles.map((ur) => ur.role.name) as RoleName[];
}

export async function getUserPermissions(
  tx: DbClient,
  userId: number,
): Promise<string[]> {
  const userRoles = await tx.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const permissionSet = new Set<string>();

  for (const ur of userRoles) {
    for (const rp of ur.role.permissions) {
      permissionSet.add(`${rp.permission.resource}:${rp.permission.action}`);
    }
  }

  return Array.from(permissionSet);
}

export async function getUserRolePermissions(
  tx: DbClient,
  userId: number,
): Promise<{ roles: RoleName[]; permissions: string[] }> {
  const [roles, permissions] = await Promise.all([
    getUserRoles(tx, userId),
    getUserPermissions(tx, userId),
  ]);

  return { roles, permissions };
}

export async function assignRoleToUser(
  tx: DbClient,
  userId: number,
  roleName: RoleName,
): Promise<void> {
  const role = await tx.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  await tx.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    create: { userId, roleId: role.id },
    update: {},
  });
}

export async function removeRoleFromUser(
  tx: DbClient,
  userId: number,
  roleName: RoleName,
): Promise<void> {
  const role = await tx.role.findUnique({ where: { name: roleName } });
  if (!role) return;

  await tx.userRole.deleteMany({
    where: { userId, roleId: role.id },
  });
}

export async function getEmployeeIdByUserId(
  tx: DbClient,
  userId: number,
): Promise<number | null> {
  const employee = await tx.employee.findUnique({
    where: { userId },
    select: { employeeId: true },
  });
  return employee?.employeeId ?? null;
}