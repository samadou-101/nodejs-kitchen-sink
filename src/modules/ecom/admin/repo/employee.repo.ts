import { prisma } from "@/config/db.config";
import type {
  CreateContractData,
  CreatePaymentData,
  PayrollInput,
  PayrollRunInput,
} from "../admin.types";
// Employee Auth
export async function insertPendingList(email: string) {
  return await prisma.pendingEmployee.create({
    data: {
      email: email,
      isPending: true,
    },
  });
}

export async function addUserRole(userId: number, roleId: number) {
  return await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId, roleId },
    },
    create: { userId, roleId },
    update: {},
  });
}

export async function findEmployeeById(employeeId: number) {
  return await prisma.employee.findUnique({
    where: {
      employeeId,
    },
  });
}

export async function getUserIdByEmployeeId(employeeId: number): Promise<number | null> {
  const employee = await prisma.employee.findUnique({
    where: { employeeId },
    select: { userId: true },
  });
  return employee?.userId ?? null;
}

export async function updateEmployeeStatus(
  employeeId: number,
  isActive: boolean,
) {
  await prisma.employee.update({
    where: { employeeId },
    data: {
      isActive,
    },
  });
}

export async function removeUserRole(userId: number, roleId: number) {
  return await prisma.userRole.deleteMany({
    where: {
      userId,
      roleId,
    },
  });
}

// Employee Payment

export async function setEmployeePaymentType(
  employeeId: number,
  paymentTypeId: number,
) {
  await prisma.employee.update({
    where: { employeeId },
    data: {
      paymentType: {
        connect: {
          paymentTypeId,
        },
      },
    },
  });
}

// Contract operations
export async function createPaymentContract(data: CreateContractData) {
  return await prisma.employeePaymentContract.create({
    data: {
      employeeId: data.employeeId,
      paymentTypeId: data.paymentTypeId,
      salaryAmount: data.salaryAmount ?? null,
      perOrderRate: data.perOrderRate ?? null,
      effectiveFrom: new Date(),
      isActive: true,
    },
  });
}

export async function closePaymentContract(contractId: number) {
  return await prisma.employeePaymentContract.update({
    where: { contractId },
    data: {
      effectiveTo: new Date(),
      isActive: false,
    },
  });
}

export async function getActiveContract(employeeId: number) {
  return await prisma.employeePaymentContract.findFirst({
    where: {
      employeeId,
      isActive: true,
    },
    orderBy: {
      effectiveFrom: "desc",
    },
  });
}

export async function getContractsInPeriod(input: PayrollInput) {
  return await prisma.employeePaymentContract.findMany({
    where: {
      employeeId: input.employeeId,
      AND: [
        {
          effectiveFrom: {
            lte: input.endDate,
          },
        },
        {
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: input.startDate } },
          ],
        },
      ],
    },
    orderBy: {
      effectiveFrom: "asc",
    },
  });
}

// Payroll helpers
export async function countOrdersInPeriod(input: PayrollInput) {
  return await prisma.order.count({
    where: {
      employeeId: input.employeeId,
      orderStatusId: 2,
      orderDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
    },
  });
}

// Ledger - immutable after creation
export async function createEmployeePayment(data: CreatePaymentData) {
  return await prisma.employeePayment.create({
    data: {
      employeeId: data.employeeId,
      amount: data.amount,
      paymentPeriodLabel: data.paymentPeriodLabel ?? null,
      paymentPeriodStart: data.paymentPeriodStart ?? null,
      paymentPeriodEnd: data.paymentPeriodEnd ?? null,
      notes: data.notes ?? null,
      contractId: data.contractId ?? null,
    },
  });
}

// Payroll Run operations
export async function createPayrollRun(input: PayrollRunInput) {
  return await prisma.payrollRun.create({
    data: {
      startDate: input.startDate,
      endDate: input.endDate,
      status: "DRAFT",
    },
  });
}

export async function addPayrollRunItems(payrollRunId: number, items: Array<{
  employeeId: number;
  contractId: number | null;
  amount: number;
  calculationStatus: string;
  paymentStatus?: string;
  warning: string | null;
}>) {
  return await prisma.payrollRunItem.createMany({
    data: items.map((item) => ({
      payrollRunId,
      employeeId: item.employeeId,
      contractId: item.contractId,
      amount: item.amount,
      calculationStatus: item.calculationStatus,
      paymentStatus: item.paymentStatus ?? "UNPAID",
      warning: item.warning,
    })),
  });
}

export async function updatePayrollRunStatus(
  payrollRunId: number,
  status: string,
  totalAmount?: number,
) {
  return await prisma.payrollRun.update({
    where: { payrollRunId },
    data: {
      status,
      ...(totalAmount !== undefined && { totalAmount }),
      ...(status === "CONFIRMED" && { confirmedAt: new Date() }),
    },
  });
}

export async function getPayrollRunById(payrollRunId: number) {
  return await prisma.payrollRun.findUnique({
    where: { payrollRunId },
    include: {
      items: true,
    },
  });
}

export async function getPayrollRuns(status?: string) {
  return await prisma.payrollRun.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });
}

export async function getActiveEmployees() {
  return await prisma.employee.findMany({
    where: { isActive: true },
    select: { employeeId: true },
  });
}

// Payroll Run Item operations
export async function getPayrollRunItemById(payrollRunItemId: number) {
  return await prisma.payrollRunItem.findUnique({
    where: { payrollRunItemId },
  });
}

export async function confirmPayrollRunItem(payrollRunItemId: number) {
  return await prisma.payrollRunItem.update({
    where: { payrollRunItemId },
    data: {
      paymentStatus: "CONFIRMED",
      confirmedAt: new Date(),
    },
  });
}

export async function markPayrollRunItemPaid(payrollRunItemId: number) {
  return await prisma.payrollRunItem.update({
    where: { payrollRunItemId },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
    },
  });
}

export async function updatePayrollRunItemPaymentStatus(
  payrollRunItemId: number,
  paymentStatus: string,
) {
  return await prisma.payrollRunItem.update({
    where: { payrollRunItemId },
    data: {
      paymentStatus,
      ...(paymentStatus === "CONFIRMED" && { confirmedAt: new Date() }),
      ...(paymentStatus === "PAID" && { paidAt: new Date() }),
    },
  });
}

export async function getAllEmployees() {
  return await prisma.employee.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
      paymentType: true,
      contracts: {
        where: { isActive: true },
      },
    },
  });
}

export async function getEmployeePerformance(employeeId: number, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [ordersHandled, paymentsReceived, activeContract] = await Promise.all([
    prisma.order.count({
      where: {
        employeeId,
        orderDate: { gte: startDate },
      },
    }),
    prisma.employeePayment.aggregate({
      where: {
        employeeId,
        paymentDate: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.employeePaymentContract.findFirst({
      where: { employeeId, isActive: true },
    }),
  ]);

  return {
    employeeId,
    period: { startDate, endDate: new Date() },
    ordersHandled,
    totalEarnings: paymentsReceived._sum.amount ?? 0,
    paymentsCount: paymentsReceived._count,
    paymentType: activeContract?.salaryAmount ? "SALARY" : "PER_ORDER",
    rate: activeContract?.salaryAmount ?? activeContract?.perOrderRate ?? null,
  };
}
