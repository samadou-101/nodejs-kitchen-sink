import type {
  Employee,
  EmployeePaymentPerOrderRate,
  PendingEmployee,
  User,
} from "@/generated/prisma/client";

export type AdminData = Omit<User, "id"> & {
  id?: number;
};

export type AdminLoginData = Omit<User, "name" | "id">;

export type EmployeeData = PendingEmployee;
export type EmployeeRate = EmployeePaymentPerOrderRate;
