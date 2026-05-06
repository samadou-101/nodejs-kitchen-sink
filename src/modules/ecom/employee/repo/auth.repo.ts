import { prisma } from "@/config/db.config";
import type {
  DbClient,
  EmployeeData,
  EmployeeRequestData,
} from "../employee.types";

// export async function insertEmployee(employeeData: EmployeeData, dbClient: DbClient) {
//     await prisma.
// }

const getClient = (tx?: DbClient) => tx || prisma;
export const employeeRepo = {
  findPendingAdminByEmail: (tx: DbClient) => (email: string) =>
    getClient(tx).pendingEmployee.findUnique({
      where: {
        email,
      },
    }),
  createUser: (tx: DbClient) => (employeeData: EmployeeRequestData) => {
    return getClient(tx).user.create({
      data: {
        name: employeeData.name,
        email: employeeData.email,
        password: employeeData.password,
      },
    });
  },
  insertEmployee:
    (tx: DbClient) =>
    (employeeData: Omit<EmployeeData, "password" | "email">) => {
      return getClient(tx).employee.create({
        data: {
          userId: employeeData.userId,
          name: employeeData.name,
          phoneNumber: employeeData.phoneNumber,
        },
      });
    },
  updatePendingIfActive: (email: string) =>
    prisma.pendingEmployee.updateMany({
      where: {
        email,
        isPending: true,
      },
      data: {
        isPending: false,
      },
    }),
};

export const bind = (tx: DbClient) => {
  return {
    findPendingAdminByEmail: employeeRepo.findPendingAdminByEmail(tx),
    createUser: employeeRepo.createUser(tx),
    insertEmployee: employeeRepo.insertEmployee(tx),
    updatePendingIfActive: employeeRepo.updatePendingIfActive,
  };
};
