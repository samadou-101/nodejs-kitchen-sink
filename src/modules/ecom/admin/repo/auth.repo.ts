import { prisma } from "@/config/db.config";
import type { AdminData } from "../admin.types";

export async function insertAdmin(adminData: AdminData) {
  return await prisma.user.create({
    data: {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
    },
  });
}

export async function findAdminByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      name: true,
      email: true,
      password: true,
    },
  });
}
