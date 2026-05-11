import { z } from "zod";
import type { PayrollRunStatus as PayrollRunStatusType } from "../../admin/admin.types";
import {
  AddEmployeeEmailSchema,
  PaymentTypeSchema,
  CreatePaymentSchema,
  PayrollRunInputSchema,
  PayrollRunStatusSchema,
  PayrollRunIdSchema,
  PayrollRunItemIdSchema,
  EmployeeIdSchema,
  EmployeePerformanceQuerySchema,
  type AddEmployeeEmail,
  type PaymentTypeData,
  type CreatePaymentData,
  type PayrollRunInput,
} from "../schemas/admin.schema";

export function validateEmail(data: unknown): AddEmployeeEmail {
  return AddEmployeeEmailSchema.parse(data);
}

export function validatePaymentType(data: unknown): PaymentTypeData {
  return PaymentTypeSchema.parse(data);
}

export function validateCreatePayment(data: unknown): CreatePaymentData {
  return CreatePaymentSchema.parse(data);
}

export function validatePayrollRunInput(data: unknown): PayrollRunInput {
  return PayrollRunInputSchema.parse(data);
}

export function validatePayrollRunStatus(status: unknown): PayrollRunStatusType | undefined {
  if (status === undefined || status === null) return undefined;
  return PayrollRunStatusSchema.parse(status);
}

export function validatePayrollRunId(id: unknown): number {
  return PayrollRunIdSchema.parse(id);
}

export function validatePayrollRunItemId(id: unknown): number {
  return PayrollRunItemIdSchema.parse(id);
}

export function validateEmployeeId(id: unknown): number {
  return EmployeeIdSchema.parse(id);
}

export function validateEmployeePerformanceQuery(data: unknown): { days?: number } {
  return EmployeePerformanceQuerySchema.parse(data) as { days?: number };
}
