import { z } from "zod";

export const EmployeeLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type EmployeeLogin = z.infer<typeof EmployeeLoginSchema>;

export const EmployeeOrderUpdateSchema = z.object({
  notes: z.string().min(1, "Notes are required"),
});
