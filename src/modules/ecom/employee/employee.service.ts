import type { EmployeeData, EmployeeRate } from "./employee.types";

export async function addEmployee(employeeData: EmployeeData) {}

export async function changeEmployeeStatus(
  employeeId: number,
  isActive: boolean,
) {}

export async function getEmployeeById(employeeId: number) {}

export async function addEmployeeRole(employeeId: number, roleId: number) {}

export async function removeEmployeeRole(employeeId: number, roleId: number) {}

export async function createEmployeeRate(
  employeeId: number,
  rateData: EmployeeRate,
) {}

export async function updateEmployeeRate(
  employeeId: number,
  newRate: EmployeeRate,
) {}
