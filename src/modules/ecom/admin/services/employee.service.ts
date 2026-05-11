import { prisma } from "@/config/db.config";
import {
  addUserRole,
  addPayrollRunItems,
  closePaymentContract,
  confirmPayrollRunItem,
  countOrdersInPeriod,
  createEmployeePayment,
  createPayrollRun,
  createPaymentContract,
  findEmployeeById as findEmployeeByIdRepo,
  getActiveContract,
  getActiveEmployees,
  getContractsInPeriod,
  getPayrollRunById,
  getPayrollRunById as getPayrollRunByIdRepo,
  getPayrollRuns,
  getPayrollRunItemById,
  insertPendingList,
  markPayrollRunItemPaid,
  removeUserRole,
  updateEmployeeStatus,
  updatePayrollRunStatus,
  getEmployeePerformance,
} from "../repo/employee.repo";
import type {
  CreateContractData,
  CreatePaymentData,
  PayrollInput,
  PayrollRunInput,
  PayrollRunItemPreview,
  PayrollRunPreview,
  PayrollRunStatus,
} from "../admin.types";
import { authorize, invalidateAuthCache } from "@/modules/ecom/auth";
import { EmployeePolicies, PayrollPolicies } from "@/modules/ecom/auth/policies";
import { assertAuth } from "@/modules/ecom/auth/errors";

export async function addEmployeeToPendingList(email: string, auth: unknown) {
  assertAuth(auth);
  authorize(auth, EmployeePolicies.create());
  await insertPendingList(email);
}

export async function assignUserRole(
  userId: number,
  roleId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, EmployeePolicies.update());
  await addUserRole(userId, roleId);
  await invalidateAuthCache(userId);
}

export async function changeEmployeeStatus(
  employeeId: number,
  isActive: boolean,
  auth: unknown,
) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    authorize(auth, EmployeePolicies.deactivate());
    await updateEmployeeStatus(employeeId, isActive);
  });
}

export async function getEmployeeById(employeeId: number, auth: unknown) {
  assertAuth(auth);
  const employee = await findEmployeeByIdRepo(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }
  const employeeContext = {
    employeeId: employee.employeeId,
    userId: employee.userId,
    isActive: employee.isActive,
  };
  authorize(auth, EmployeePolicies.view(employeeContext));
  return employee;
}

export async function unassignUserRole(
  userId: number,
  roleId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, EmployeePolicies.update());
  await removeUserRole(userId, roleId);
  await invalidateAuthCache(userId);
}

export async function assignEmployeePaymentType(
  employeeId: number,
  paymentTypeId: number,
  auth: unknown,
  salaryAmount?: number,
  perOrderRate?: number,
) {
  assertAuth(auth);

  const employee = await findEmployeeByIdRepo(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }
  authorize(auth, EmployeePolicies.managePayment({
    employeeId: employee.employeeId,
    userId: employee.userId,
    isActive: employee.isActive,
  }));

  return await prisma.$transaction(async (tx) => {
    const data: CreateContractData = {
      employeeId,
      paymentTypeId,
      salaryAmount: salaryAmount ?? null,
      perOrderRate: perOrderRate ?? null,
    };
    await createPaymentContract(data);
  });
}

export async function updateEmployeeSalary(
  employeeId: number,
  salaryAmount: number,
  auth: unknown,
) {
  assertAuth(auth);

  const employee = await findEmployeeByIdRepo(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }
  authorize(auth, EmployeePolicies.managePayment({
    employeeId: employee.employeeId,
    userId: employee.userId,
    isActive: employee.isActive,
  }));

  return await prisma.$transaction(async (tx) => {
    const activeContract = await getActiveContract(employeeId);
    if (activeContract) {
      await closePaymentContract(activeContract.contractId);
    }
    const data: CreateContractData = {
      employeeId,
      paymentTypeId: 1,
      salaryAmount,
    };
    await createPaymentContract(data);
  });
}

export async function assignEmployeeRate(
  employeeId: number,
  perOrderRate: number,
  auth: unknown,
) {
  assertAuth(auth);

  const employee = await findEmployeeByIdRepo(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }
  authorize(auth, EmployeePolicies.managePayment({
    employeeId: employee.employeeId,
    userId: employee.userId,
    isActive: employee.isActive,
  }));

  return await prisma.$transaction(async (tx) => {
    const activeContract = await getActiveContract(employeeId);
    if (activeContract) {
      await closePaymentContract(activeContract.contractId);
    }
    const data: CreateContractData = {
      employeeId,
      paymentTypeId: 2,
      perOrderRate,
    };
    await createPaymentContract(data);
  });
}

export async function calculatePayroll(
  employeeId: number,
  startDate: Date,
  endDate: Date,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, PayrollPolicies.view());

  const input: PayrollInput = { employeeId, startDate, endDate };
  const contracts = await getContractsInPeriod(input);
  let totalEarnings = 0;

  for (const contract of contracts) {
    if (contract.salaryAmount !== null) {
      totalEarnings += contract.salaryAmount;
    } else if (contract.perOrderRate !== null) {
      const orderCount = await countOrdersInPeriod(input);
      totalEarnings += orderCount * contract.perOrderRate;
    }
  }

  return totalEarnings;
}

export async function createPayment(
  employeeId: number,
  amount: number,
  auth: unknown,
  paymentPeriodLabel?: string,
  notes?: string,
  contractId?: number,
) {
  assertAuth(auth);

  const employee = await findEmployeeByIdRepo(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }
  authorize(auth, EmployeePolicies.managePayment({
    employeeId: employee.employeeId,
    userId: employee.userId,
    isActive: employee.isActive,
  }));

  return await prisma.$transaction(async (tx) => {
    const data: CreatePaymentData = {
      employeeId,
      amount,
      paymentPeriodLabel: paymentPeriodLabel ?? null,
      notes: notes ?? null,
      contractId: contractId ?? null,
    };
    await createEmployeePayment(data);
  });
}

async function calculateEmployeePayroll(
  employeeId: number,
  startDate: Date,
  endDate: Date,
) {
  const input: PayrollInput = { employeeId, startDate, endDate };
  const contracts = await getContractsInPeriod(input);
  const activeContract = await getActiveContract(employeeId);

  let amount = 0;
  let warning: string | null = null;
  let contractId: number | null = null;
  let contractType: "salary" | "perOrder" | null = null;
  let hasOrders = false;

  if (!activeContract) {
    return {
      employeeId,
      contractId: null,
      amount: 0,
      warning: "No active contract",
      contractType: null,
      hasOrders: false,
    };
  }

  contractId = activeContract.contractId;
  contractType = activeContract.salaryAmount !== null ? "salary" : "perOrder";

  if (contracts.length === 0) {
    return {
      employeeId,
      contractId,
      amount: 0,
      warning: "No contracts in period",
      contractType,
      hasOrders: false,
    };
  }

  if (contracts.length > 1) {
    warning = "Multiple contracts in period";
  }

  for (const contract of contracts) {
    if (contract.salaryAmount !== null) {
      amount += contract.salaryAmount;
    } else if (contract.perOrderRate !== null) {
      const orderCount = await countOrdersInPeriod(input);
      hasOrders = orderCount > 0;
      amount += orderCount * contract.perOrderRate;
    } else {
      warning = "Missing salary or rate";
    }
  }

  if (amount === 0 && contractType === "perOrder" && !hasOrders) {
    warning = "Per-order employee with no confirmed orders";
  } else if (amount === 0 && contractType === "salary") {
    warning = "Salary employee calculated to zero";
  }

  return { employeeId, contractId, amount, warning, contractType, hasOrders };
}

export async function runPayrollPreview(
  input: PayrollRunInput,
  auth: unknown,
): Promise<PayrollRunPreview> {
  assertAuth(auth);
  authorize(auth, PayrollPolicies.create());

  const { startDate, endDate, employeeIds } = input;

  const targetEmployees = employeeIds?.length
    ? employeeIds.map((id) => ({ employeeId: id }))
    : await getActiveEmployees();

  const items: PayrollRunItemPreview[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalAmount = 0;

  for (const emp of targetEmployees) {
    const calcResult = await calculateEmployeePayroll(
      emp.employeeId,
      startDate,
      endDate,
    );

    if (
      calcResult.warning === "No active contract" ||
      calcResult.warning === "Missing salary or rate"
    ) {
      errors.push(`Employee ${emp.employeeId}: ${calcResult.warning}`);
      items.push({ ...calcResult, calculationStatus: "EXCLUDED", paymentStatus: "UNPAID", paidAt: null, confirmedAt: null });
    } else {
      if (calcResult.warning) {
        warnings.push(`Employee ${emp.employeeId}: ${calcResult.warning}`);
      }
      items.push({ ...calcResult, calculationStatus: "INCLUDED", paymentStatus: "UNPAID", paidAt: null, confirmedAt: null });
      totalAmount += calcResult.amount;
    }
  }

  const run = await createPayrollRun({
    startDate,
    endDate,
    employeeIds: employeeIds ?? [],
  });

  await addPayrollRunItems(
    run.payrollRunId,
    items.map((item) => ({
      employeeId: item.employeeId,
      contractId: item.contractId,
      amount: item.amount,
      calculationStatus: item.calculationStatus,
      paymentStatus: "UNPAID",
      warning: item.warning,
    })),
  );

  return {
    payrollRunId: run.payrollRunId,
    items,
    totalAmount,
    warnings,
    errors,
  };
}

export async function confirmPayrollRun(
  payrollRunId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, PayrollPolicies.confirm());

  const run = await getPayrollRunById(payrollRunId);
  if (!run) {
    throw new Error("Payroll run not found");
  }

  if (run.status !== "DRAFT") {
    throw new Error("Only DRAFT payroll runs can be confirmed");
  }

  const includedItems = run.items.filter(
    (item) => item.calculationStatus === "INCLUDED",
  );

  const label = `Payroll run #${payrollRunId}`;
  for (const item of includedItems) {
    const data: CreatePaymentData = {
      employeeId: item.employeeId,
      amount: item.amount,
      paymentPeriodLabel: label,
      paymentPeriodStart: run.startDate,
      paymentPeriodEnd: run.endDate,
      notes: `Payroll run #${payrollRunId}`,
      contractId: item.contractId ?? null,
    };
    await createEmployeePayment(data);
    await confirmPayrollRunItem(item.payrollRunItemId);
  }

  const totalAmount = includedItems.reduce(
    (sum: number, item) => sum + item.amount,
    0,
  );
  await updatePayrollRunStatus(payrollRunId, "CONFIRMED", totalAmount);

  return { success: true, totalAmount, employeeCount: includedItems.length };
}

export async function markPayrollRunAsPaid(
  payrollRunId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, PayrollPolicies.finalize());

  const run = await getPayrollRunById(payrollRunId);
  if (!run) {
    throw new Error("Payroll run not found");
  }

  if (run.status !== "CONFIRMED") {
    throw new Error("Only CONFIRMED payroll runs can be marked as paid");
  }

  const confirmedItems = run.items.filter(
    (item) => item.paymentStatus === "CONFIRMED",
  );
  for (const item of confirmedItems) {
    await markPayrollRunItemPaid(item.payrollRunItemId);
  }

  await updatePayrollRunStatus(payrollRunId, "PAID");
  return { success: true, employeeCount: confirmedItems.length };
}

export async function getPayrollRunsService(
  status?: PayrollRunStatus,
  auth?: unknown,
) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, PayrollPolicies.view());
  }
  return await getPayrollRuns(status);
}

export async function getPayrollRunByIdService(
  payrollRunId: number,
  auth?: unknown,
) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, PayrollPolicies.view());
  }
  return await getPayrollRunById(payrollRunId);
}

export async function getPayrollRunItemByIdService(
  payrollRunItemId: number,
  auth?: unknown,
) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, PayrollPolicies.viewItem());
  }
  return await getPayrollRunItemById(payrollRunItemId);
}

export async function confirmPayrollItem(
  payrollRunItemId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, PayrollPolicies.updateItem());

  const item = await getPayrollRunItemById(payrollRunItemId);
  if (!item) {
    throw new Error("Payroll run item not found");
  }

  if (item.calculationStatus !== "INCLUDED") {
    throw new Error("Only INCLUDED items can be confirmed");
  }

  if (item.paymentStatus !== "UNPAID") {
    throw new Error("Only UNPAID items can be confirmed");
  }

  const run = await getPayrollRunByIdRepo(item.payrollRunId);
  if (!run) {
    throw new Error("Payroll run not found");
  }

  const label = `Payroll run #${run.payrollRunId}`;

  const data: CreatePaymentData = {
    employeeId: item.employeeId,
    amount: item.amount,
    paymentPeriodLabel: label,
    paymentPeriodStart: run.startDate,
    paymentPeriodEnd: run.endDate,
    notes: `Payroll run #${run.payrollRunId}, Item #${payrollRunItemId}`,
    contractId: item.contractId ?? null,
  };
  await createEmployeePayment(data);
  await confirmPayrollRunItem(payrollRunItemId);

  return { success: true, payrollRunItemId, amount: item.amount };
}

export async function payPayrollItem(
  payrollRunItemId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, PayrollPolicies.updateItem());

  const item = await getPayrollRunItemById(payrollRunItemId);
  if (!item) {
    throw new Error("Payroll run item not found");
  }

  if (item.paymentStatus !== "CONFIRMED") {
    throw new Error("Only CONFIRMED items can be marked as paid");
  }

  await markPayrollRunItemPaid(payrollRunItemId);
  return { success: true, payrollRunItemId, amount: item.amount };
}

export async function getEmployeePerformanceService(
  employeeId: number,
  auth: unknown,
  days?: number,
) {
  assertAuth(auth);
  authorize(auth, EmployeePolicies.viewPerformance());
  return await getEmployeePerformance(employeeId, days);
}