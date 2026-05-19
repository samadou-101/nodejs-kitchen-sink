import { hashPassword, verifyPassword } from "@/api/auth/auth.utils";
import type { AdminData, AdminLoginData } from "../admin.types";
import {
  findAdminByEmail,
  findPendingAdminByEmail,
  insertAdmin,
  updatePending,
} from "../repo/auth.repo";
import { prisma } from "@/config/db.config";
import {
  cacheUserSession,
  createSession,
} from "@/api/auth/password/session.service";
import { logger } from "@/modules/ecom/shared/logger";

export async function registerAdmin(adminData: AdminData) {
  const inPendingList = await findPendingAdminByEmail(adminData.email);
  logger.debug({ inPendingList }, "Pending admin check");
  if (!inPendingList) {
    throw new Error("Email not activated");
  }
  if (!inPendingList.isPending) {
    throw new Error("Email already activated");
  }

  const hashedPass = await hashPassword(adminData.password);
  const admin = await insertAdmin({ ...adminData, password: hashedPass });
  const sessionData = await createSession(admin.id);
  if (sessionData !== null) {
    await cacheUserSession(sessionData);
  }
  await updatePending(adminData.email, false);

  return { admin, sessionData };
}

export async function loginAdmin(AdminLoginData: AdminLoginData) {
  const existingAdmin = await findAdminByEmail(AdminLoginData.email);
  if (!existingAdmin) {
    throw new Error("No Admin found");
  }

  const validPassword = await verifyPassword(
    AdminLoginData.password,
    existingAdmin.password,
  );
  if (!validPassword) {
    throw new Error("Invalid Credentials");
  }
  const sessionData = await createSession(existingAdmin.id);
  if (sessionData !== null) {
    await cacheUserSession(sessionData);
  }
  return { name: existingAdmin.name, email: existingAdmin.email, sessionData };
}

export async function logoutAdmin(adminId: number) {}
