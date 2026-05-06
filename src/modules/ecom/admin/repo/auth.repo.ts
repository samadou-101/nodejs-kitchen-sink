import { prisma } from "@/config/db.config";
import type { AdminData } from "../admin.types";

export async function insertAdmin(adminData: AdminData) {
  return await prisma.user.create({
    data: {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: false,
    },
  });
}

export async function findAdminByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });
}

export async function updatePending(email: string, isPending: boolean) {
  await prisma.pendingAdmin.update({
    where: {
      email,
    },
    data: {
      isPending: isPending,
    },
  });
}
