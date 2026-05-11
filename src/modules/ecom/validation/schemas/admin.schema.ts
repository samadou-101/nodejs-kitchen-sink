import { z } from "zod";

export const AddEmployeeEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type AddEmployeeEmail = z.infer<typeof AddEmployeeEmailSchema>;

export const PaymentTypeSchema = z.discriminatedUnion("paymentTypeId", [
  z.object({
    paymentTypeId: z.literal(1),
    salaryAmount: z.number().positive("Salary amount must be positive"),
  }),
  z.object({
    paymentTypeId: z.literal(2),
    perOrderRate: z.number().positive("Per-order rate must be positive"),
  }),
]);

export type PaymentTypeData = z.infer<typeof PaymentTypeSchema>;

export const CreatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentPeriodLabel: z.string().optional(),
  notes: z.string().optional(),
  contractId: z.number().int().positive().optional(),
});

export type CreatePaymentData = z.infer<typeof CreatePaymentSchema>;

export const PayrollRunInputSchema = z.object({
  startDate: z.coerce.date("Start date is required"),
  endDate: z.coerce.date("End date is required"),
  employeeIds: z.array(z.number().int().positive()).optional(),
});

export type PayrollRunInput = z.infer<typeof PayrollRunInputSchema>;

export const PayrollRunStatusSchema = z.enum(["DRAFT", "CONFIRMED", "PAID"]);

export type PayrollRunStatus = z.infer<typeof PayrollRunStatusSchema>;

export const PayrollRunIdSchema = z.coerce.number().int().positive("Payroll run ID must be a positive integer");

export const PayrollRunItemIdSchema = z.coerce.number().int().positive("Payroll run item ID must be a positive integer");

export const EmployeeIdSchema = z.coerce.number().int().positive("Employee ID must be a positive integer");

export const EmployeePerformanceQuerySchema = z.object({
  days: z.coerce.number().int().positive().optional(),
});
