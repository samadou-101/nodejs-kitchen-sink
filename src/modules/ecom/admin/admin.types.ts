import type {
  Employee,
  EmployeePaymentPerOrderRate,
  User,
} from "@/generated/prisma/client";

export type AdminData = Omit<User, "id"> & {
  id?: number;
};

export type AdminLoginData = Omit<User, "name" | "id">;

export type EmployeeData = Employee;
export type EmployeeRate = EmployeePaymentPerOrderRate;
