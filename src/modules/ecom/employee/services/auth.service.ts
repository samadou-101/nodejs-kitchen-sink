import { hashPassword } from "@/api/auth/auth.utils";
import type { EmployeeData, EmployeeRequestData } from "../employee.types";
import { bind } from "../repo/auth.repo";
import { prisma } from "@/config/db.config";
import {
  cacheUserSession,
  createSession,
} from "@/api/auth/password/session.service";

export async function registerEmployee(data: EmployeeRequestData) {
  const hashedPass = await hashPassword(data.password);

  const employee = await prisma.$transaction(async (tx) => {
    const repo = bind(tx);

    const pending = await repo.findPendingAdminByEmail(data.email);

    if (!pending) {
      throw new Error("Email not activated");
    }

    if (!pending.isPending) {
      throw new Error("Email already activated");
    }

    const user = await repo.createUser({
      ...data,
      password: hashedPass,
    });

    const employeeData: Omit<EmployeeData, "email" | "password"> = {
      userId: user.id,
      name: user.name,
      phoneNumber: data.phoneNumber,
    };

    const employee = await repo.insertEmployee(employeeData);

    // atomic update (prevents double activation race condition)
    const updated = await repo.updatePendingIfActive(data.email);

    if (!updated) {
      throw new Error("Email was already processed");
    }

    return employee;
  });

  const sessionData = await createSession(employee.userId);

  if (sessionData) {
    await cacheUserSession(sessionData);
  }

  return { employee, sessionData };
}
