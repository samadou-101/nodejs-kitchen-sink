import type { EmployeeLoginData } from "../../employee/employee.types";
import {
  EmployeeLoginSchema,
  EmployeeOrderUpdateSchema,
} from "../schemas/employee.schema";

export function validateEmployeeLogin(data: unknown): EmployeeLoginData {
  const parsed = EmployeeLoginSchema.parse(data);
  return { ...parsed, phoneNumber: null };
}

export function validateOrderNote(data: unknown): { notes: string } {
  return EmployeeOrderUpdateSchema.parse(data);
}
