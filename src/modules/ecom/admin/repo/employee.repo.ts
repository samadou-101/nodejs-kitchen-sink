import { prisma } from "@/config/db.config";

// Employee Auth
export async function insertPendingList(email: string) {
  console.log(email, "from repo");
  return await prisma.pendingEmployee.create({
    data: {
      email: email,
      isPending: true,
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

export async function findEmployeeById(employeeId: number) {
  await prisma.employee.findUnique({
    where: {
      employeeId,
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

// Employee Payment

export async function setEmployeePaymentType(
  employeeId: number,
  paymentTypeId: number,
) {
  await prisma.employee.update({
    where: { employeeId },
    data: {
      paymentType: {
        connect: {
          paymentTypeId,
        },
      },
    },
  });
}
