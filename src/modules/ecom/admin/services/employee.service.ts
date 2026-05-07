import type { EmployeeRate } from "../admin.types";
import {
  addEmployeeRole,
  findEmployeeById as findEmployeeByIdRepo,
  insertPendingList,
  removeEmployeeRole,
  setEmployeePaymentType,
  updateEmployeeStatus,
} from "../repo/employee.repo";

export async function addEmployeeToPendingList(email: string) {
  await insertPendingList(email);
}

export async function assignEmployeeRole(employeeId: number, roleId: number) {
  await addEmployeeRole(employeeId, roleId);
}

export async function changeEmployeeStatus(
  employeeId: number,
  isActive: boolean,
) {
  await updateEmployeeStatus(employeeId, isActive);
}

export async function getEmployeeById(employeeId: number) {
  await findEmployeeByIdRepo(employeeId);
}

export async function unassignEmployeeRole(employeeId: number, roleId: number) {
  await removeEmployeeRole(employeeId, roleId);
}

export async function assignEmployeePaymentType(
  employeeId: number,
  paymentTypeId: number,
) {
  await setEmployeePaymentType(employeeId, paymentTypeId);
}

export async function updateEmployeeSalary(
  emplyoeeId: number,
  salary: number,
) {}

export async function setEmployeeRate(
  employeeId: number,
  rateData: EmployeeRate,
) {}

export async function updateEmployeeRate(
  employeeId: number,
  newRate: EmployeeRate,
) {}
