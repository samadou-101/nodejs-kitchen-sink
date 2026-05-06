import type { EmployeeData, EmployeeRate } from "../admin.types";
import { insertPendingList } from "../repo/employee.repo";

export async function addEmployeeToPendingList(email: string) {
  await insertPendingList(email);
}

export async function addEmployeeRole(employeeId: number, roleId: number) {}

export async function changeEmployeeStatus(
  employeeId: number,
  isActive: boolean,
) {}

export async function getEmployeeById(employeeId: number) {}

export async function removeEmployeeRole(employeeId: number, roleId: number) {}

export async function createEmployeeRate(
  employeeId: number,
  rateData: EmployeeRate,
) {}

export async function updateEmployeeRate(
  employeeId: number,
  newRate: EmployeeRate,
) {}
