import { hashPassword, verifyPassword } from "@/api/auth/auth.utils";
import type { AdminData, AdminLoginData } from "../admin.types";
import { findAdminByEmail, insertAdmin } from "../repo/auth.repo";

export async function registerAdmin(adminData: AdminData) {
  const hashedPass = await hashPassword(adminData.password);
  await insertAdmin({ ...adminData, password: hashedPass });
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
  return existingAdmin;
}

export async function logoutAdmin(adminId: number) {}
