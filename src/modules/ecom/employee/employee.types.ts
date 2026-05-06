import {
  Prisma,
  type EmployeePaymentPerOrderRate,
  type PrismaClient,
} from "@/generated/prisma/client";

export type EmployeeRequestData = {
  name: string;
  email: string;
  phoneNumber: string | null;
  password: string;
};
export type EmployeeData = {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  password: string;
};
export type EmployeeRate = EmployeePaymentPerOrderRate;

export type DbClient = PrismaClient | Prisma.TransactionClient;
