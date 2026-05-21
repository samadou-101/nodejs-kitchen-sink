import { assignRoleToUser } from "@/modules/ecom/auth/rbac/rbac.repo";
import { hashPassword, verifyPassword } from "@/modules/ecom/auth/utils/password.utils";
import type { EmployeeData, EmployeeLoginData, EmployeeRequestData } from "../employee.types";
import { bind } from "../repo/auth.repo";
import { prisma } from "@/config/db.config";
import {
  cacheUserSession,
  createSession,
} from "@/modules/ecom/auth/session/session.service";

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

    await assignRoleToUser(tx, user.id, "EMPLOYEE");

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

export async function loginEmployee(loginData: EmployeeLoginData) {
  const repo = bind(prisma);
  const existingEmployee = await repo.findEmployeeByEmail(loginData.email);
  if (!existingEmployee) {
    throw new Error("No Employee found");
  }

  const validPassword = await verifyPassword(
    loginData.password,
    existingEmployee.password,
  );
  if (!validPassword) {
    throw new Error("Invalid Credentials");
  }
  const sessionData = await createSession(existingEmployee.id);
  if (sessionData !== null) {
    await cacheUserSession(sessionData);
  }
  return { name: existingEmployee.name, email: existingEmployee.email, sessionData };
}

export async function logoutEmployee(employeeId: number) {}
