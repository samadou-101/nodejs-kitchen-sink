import { prisma } from "@/config/db.config";

export async function insertPendingList(email: string) {
  console.log(email, "from repo");
  return await prisma.pendingEmployee.create({
    data: {
      email: email,
      isPending: true,
    },
  });
}

export async function findEmployeeById(employeeId: number) {
  await prisma.employee.findUnique({
    where: {
      employeeId,
    },
  });
}

export async function addEmployeeRole(employeeId: number, roleId: number) {
  await prisma.employee.update({
    where: { employeeId },
    data: {
      roles: {
        create: {
          roleId,
        },
      },
    },
  });
}

export async function updateEmployeeStatus(
  employeeId: number,
  isActive: boolean,
) {
  await prisma.employee.update({
    where: { employeeId },
    data: {
      isActive,
    },
  });
}

export async function removeEmployeeRole(employeeId: number, roleId: number) {
  await prisma.employeeRoleAssignment.delete({
    where: {
      employeeId_roleId: {
        employeeId,
        roleId,
      },
    },
  });
}
