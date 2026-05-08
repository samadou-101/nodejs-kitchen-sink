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
  paymentPeriodLabel?: string | null;
  paymentPeriodStart?: Date | null;
  paymentPeriodEnd?: Date | null;
  notes?: string | null;
  contractId?: number | null;
}

export type PayrollRunStatus = "DRAFT" | "CONFIRMED" | "PAID";
export type PayrollRunItemCalculationStatus = "PENDING" | "INCLUDED" | "EXCLUDED";
export type PayrollRunItemPaymentStatus = "UNPAID" | "CONFIRMED" | "PAID";

export interface PayrollRunInput {
  startDate: Date;
  endDate: Date;
  employeeIds?: number[];
}

export interface PayrollRunItemPreview {
  employeeId: number;
  contractId: number | null;
  amount: number;
  calculationStatus: PayrollRunItemCalculationStatus;
  paymentStatus: PayrollRunItemPaymentStatus;
  warning: string | null;
  paidAt: Date | null;
  confirmedAt: Date | null;
}

export interface PayrollRunPreview {
  payrollRunId?: number;
  items: PayrollRunItemPreview[];
  totalAmount: number;
  warnings: string[];
  errors: string[];
}
