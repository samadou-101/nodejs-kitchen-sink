import { prisma } from "@/config/db.config";
import type { RoleName } from "./rbac.types";
import { Resource, Action } from "./rbac.types";

interface RoleSeed {
  name: RoleName;
  description: string;
  permissions: { resource: string; action: string }[];
}

const ROLE_SEEDS: RoleSeed[] = [
  {
    name: "SUPERADMIN",
    description: "Full system access",
    permissions: [{ resource: "*", action: "*" }],
  },
  {
    name: "ADMIN",
    description: "E-commerce management",
    permissions: [
      { resource: "product", action: "*" },
      { resource: "order", action: "*" },
      { resource: "inventory", action: "*" },
      { resource: "employee", action: "*" },
      { resource: "payroll", action: "*" },
      { resource: "customer", action: "*" },
    ],
  },
  {
    name: "EMPLOYEE",
    description: "Order confirmation only",
    permissions: [
      { resource: "order", action: "read" },
      { resource: "order", action: "update" },
    ],
  },
];

const PERMISSION_SEEDS = [
  { resource: "product", action: "create" },
  { resource: "product", action: "read" },
  { resource: "product", action: "update" },
  { resource: "product", action: "delete" },
  { resource: "order", action: "create" },
  { resource: "order", action: "read" },
  { resource: "order", action: "update" },
  { resource: "order", action: "confirm" },
  { resource: "order", action: "delete" },
  { resource: "inventory", action: "create" },
  { resource: "inventory", action: "read" },
  { resource: "inventory", action: "update" },
  { resource: "inventory", action: "delete" },
  { resource: "employee", action: "create" },
  { resource: "employee", action: "read" },
  { resource: "employee", action: "update" },
  { resource: "employee", action: "delete" },
  { resource: "payroll", action: "create" },
  { resource: "payroll", action: "read" },
  { resource: "payroll", action: "update" },
  { resource: "customer", action: "create" },
  { resource: "customer", action: "read" },
  { resource: "customer", action: "update" },
  { resource: "customer", action: "delete" },
];

export async function seedRoles(): Promise<void> {
  console.log("Seeding RBAC roles and permissions...");

  for (const permission of PERMISSION_SEEDS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: permission.resource, action: permission.action } },
      create: permission,
      update: {},
    });
  }

  for (const roleSeed of ROLE_SEEDS) {
    const role = await prisma.role.upsert({
      where: { name: roleSeed.name },
      create: { name: roleSeed.name, description: roleSeed.description },
      update: { description: roleSeed.description },
    });

    for (const perm of roleSeed.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: permission.id },
          },
          create: { roleId: role.id, permissionId: permission.id },
          update: {},
        });
      }
    }
  }

  console.log("RBAC roles and permissions seeded successfully");
}

export async function assignRoleToUser(
  userId: number,
  roleName: RoleName,
): Promise<void> {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    create: { userId, roleId: role.id },
    update: {},
  });
}

export async function removeRoleFromUser(
  userId: number,
  roleName: RoleName,
): Promise<void> {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return;

  await prisma.userRole.deleteMany({
    where: { userId, roleId: role.id },
  });
}