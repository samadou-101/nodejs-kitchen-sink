import type { PendingEmployee, User } from "@/generated/prisma/client";

export type AdminData = Omit<User, "id"> & {
  id?: number;
};

export type AdminLoginData = Omit<User, "name" | "id">;

export type EmployeeData = PendingEmployee;

export interface CreateContractData {
  employeeId: number;
  paymentTypeId: number;
  salaryAmount?: number | null;
  perOrderRate?: number | null;
}

export interface PayrollInput {
  employeeId: number;
  startDate: Date;
  endDate: Date;
}

export interface CreatePaymentData {
  employeeId: number;
  amount: number;
  paymentPeriod?: string | null;
  notes?: string | null;
  contractId?: number | null;
}

export type PayrollRunStatus = "DRAFT" | "CONFIRMED" | "PAID";
export type PayrollRunItemStatus = "PENDING" | "INCLUDED" | "EXCLUDED";

export interface PayrollRunInput {
  startDate: Date;
  endDate: Date;
  employeeIds?: number[];
}

export interface PayrollRunItemPreview {
  employeeId: number;
  contractId: number | null;
  amount: number;
  status: PayrollRunItemStatus;
  warning: string | null;
}

export interface PayrollRunPreview {
  payrollRunId?: number;
  items: PayrollRunItemPreview[];
  totalAmount: number;
  warnings: string[];
  errors: string[];
}
