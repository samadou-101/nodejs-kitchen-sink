import {
  addEmployeeRole,
  addPayrollRunItems,
  closePaymentContract,
  countOrdersInPeriod,
  createEmployeePayment,
  createPayrollRun,
  createPaymentContract,
  findEmployeeById as findEmployeeByIdRepo,
  getActiveContract,
  getActiveEmployees,
  getContractsInPeriod,
  getPayrollRunById,
  getPayrollRuns,
  insertPendingList,
  removeEmployeeRole,
  updateEmployeeStatus,
  updatePayrollRunStatus,
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

// Employee  Auth
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

// Employee Payments
export async function assignEmployeePaymentType(
  employeeId: number,
  paymentTypeId: number,
  salaryAmount?: number,
  perOrderRate?: number,
) {
  const data: CreateContractData = {
    employeeId,
    paymentTypeId,
    salaryAmount: salaryAmount ?? null,
    perOrderRate: perOrderRate ?? null,
  };
  await createPaymentContract(data);
}

export async function updateEmployeeSalary(
  employeeId: number,
  salaryAmount: number,
) {
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
}

export async function assignEmployeeRate(
  employeeId: number,
  perOrderRate: number,
) {
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
}

export async function calculatePayroll(
  employeeId: number,
  startDate: Date,
  endDate: Date,
) {
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
  paymentPeriod?: string,
  notes?: string,
  contractId?: number,
) {
  const data: CreatePaymentData = {
    employeeId,
    amount,
    paymentPeriod: paymentPeriod ?? null,
    notes: notes ?? null,
    contractId: contractId ?? null,
  };
  await createEmployeePayment(data);
}

// Payroll Run

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

  if (!activeContract) {
    return {
      employeeId,
      contractId: null,
      amount: 0,
      warning: "No active contract",
    };
  }

  contractId = activeContract.contractId;

  if (contracts.length === 0) {
    return {
      employeeId,
      contractId,
      amount: 0,
      warning: "No contracts in period",
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
      amount += orderCount * contract.perOrderRate;
    } else {
      warning = "Missing salary or rate";
    }
  }

  if (amount === 0) {
    warning = "Zero earnings";
  }

  return { employeeId, contractId, amount, warning };
}

export async function runPayrollPreview(
  input: PayrollRunInput,
): Promise<PayrollRunPreview> {
  const { startDate, endDate, employeeIds } = input;

  const targetEmployees = employeeIds?.length
    ? employeeIds.map((id) => ({ employeeId: id }))
    : await getActiveEmployees();

  const items: PayrollRunItemPreview[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalAmount = 0;

  for (const emp of targetEmployees) {
    const result = await calculateEmployeePayroll(
      emp.employeeId,
      startDate,
      endDate,
    );

    if (
      result.warning === "No active contract" ||
      result.warning === "Missing salary or rate"
    ) {
      errors.push(`Employee ${emp.employeeId}: ${result.warning}`);
      items.push({ ...result, status: "EXCLUDED" });
    } else {
      if (result.warning) {
        warnings.push(`Employee ${emp.employeeId}: ${result.warning}`);
      }
      items.push({ ...result, status: "INCLUDED" });
      totalAmount += result.amount;
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
      status: item.status,
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

export async function confirmPayrollRun(payrollRunId: number) {
  const run = await getPayrollRunById(payrollRunId);
  if (!run) {
    throw new Error("Payroll run not found");
  }

  if (run.status !== "DRAFT") {
    throw new Error("Only DRAFT payroll runs can be confirmed");
  }

  const includedItems = run.items.filter((item) => item.status === "INCLUDED");

  for (const item of includedItems) {
    const data: CreatePaymentData = {
      employeeId: item.employeeId,
      amount: item.amount,
      paymentPeriod: `${run.startDate.toISOString()} - ${run.endDate.toISOString()}`,
      notes: `Payroll run #${payrollRunId}`,
      contractId: item.contractId ?? null,
    };
    await createEmployeePayment(data);
  }

  const totalAmount = includedItems.reduce(
    (sum: number, item) => sum + item.amount,
    0,
  );
  await updatePayrollRunStatus(payrollRunId, "CONFIRMED", totalAmount);

  return { success: true, totalAmount, employeeCount: includedItems.length };
}

export async function markPayrollRunAsPaid(payrollRunId: number) {
  const run = await getPayrollRunById(payrollRunId);
  if (!run) {
    throw new Error("Payroll run not found");
  }

  if (run.status !== "CONFIRMED") {
    throw new Error("Only CONFIRMED payroll runs can be marked as paid");
  }

  await updatePayrollRunStatus(payrollRunId, "PAID");
  return { success: true };
}

export async function getPayrollRunsService(status?: PayrollRunStatus) {
  return await getPayrollRuns(status);
}

export async function getPayrollRunByIdService(payrollRunId: number) {
  return await getPayrollRunById(payrollRunId);
}
