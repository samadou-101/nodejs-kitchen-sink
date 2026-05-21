import type { Request, Response, NextFunction } from "express";
import {
  assignEmployeePaymentType,
  assignEmployeeRate,
  addEmployeeToPendingList,
  confirmPayrollItem,
  createPayment,
  payPayrollItem,
  updateEmployeeSalary,
  getPayrollRunsService,
  getPayrollRunByIdService,
  getPayrollRunItemByIdService,
  confirmPayrollRun,
  markPayrollRunAsPaid,
  runPayrollPreview,
  getEmployeePerformanceService,
  listEmployees,
} from "../services/employee.service";
import type { PayrollRunInput } from "../admin.types";
import {
  validateEmail,
  validatePaymentType,
  validateCreatePayment,
  validatePayrollRunInput,
  validatePayrollRunStatus,
  validatePayrollRunId,
  validatePayrollRunItemId,
  validateEmployeeId,
  validateEmployeePerformanceQuery,
} from "@/modules/ecom/validation/validators/admin.validator";
import {
  sendSuccess,
  sendCreated,
  sendError,
} from "@/modules/ecom/shared/response";

export async function employeeAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = req.path;
  const method = req.method;
  const POST_METHOD = "POST";
  const GET_METHOD = "GET";

  const EMPLOYEE_ACTIVATION_PATH = "/admin/employee/add";
  const EMPLOYEE_PAYMENT_TYPE_PATH = /^\/admin\/employees\/(\d+)\/payment-type$/;
  const EMPLOYEE_PAYMENT_PATH = /^\/admin\/employees\/(\d+)\/payments$/;

  const PAYROLL_PREVIEW_PATH = "/admin/payroll/preview";
  const PAYROLL_CREATE_PATH = "/admin/payroll";
  const PAYROLL_LIST_PATH = "/admin/payroll";
  const PAYROLL_GET_PATH = /^\/admin\/payroll\/(\d+)$/;
  const PAYROLL_CONFIRM_PATH = /^\/admin\/payroll\/(\d+)\/confirm$/;
  const PAYROLL_PAID_PATH = /^\/admin\/payroll\/(\d+)\/paid$/;

  const PAYROLL_ITEM_GET_PATH = /^\/admin\/payroll\/(\d+)\/items\/(\d+)$/;
  const PAYROLL_ITEM_CONFIRM_PATH = /^\/admin\/payroll\/(\d+)\/items\/(\d+)\/confirm$/;
  const PAYROLL_ITEM_PAID_PATH = /^\/admin\/payroll\/(\d+)\/items\/(\d+)\/paid$/;

  const EMPLOYEE_LIST_PATH = "/admin/employees";

  const EMPLOYEE_PERF_PATH = /^\/admin\/employees\/(\d+)\/performance$/;

  if (path === EMPLOYEE_ACTIVATION_PATH && method === POST_METHOD) {
    try {
      const { email } = validateEmail(req.body ?? {});
      await addEmployeeToPendingList(email, req.auth);
      sendCreated(res, { message: "Employee activated" });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const paymentTypeMatch = path.match(EMPLOYEE_PAYMENT_TYPE_PATH);
  if (paymentTypeMatch && method === POST_METHOD) {
    try {
      const employeeId = validateEmployeeId(paymentTypeMatch[1]);
      const paymentType = validatePaymentType(req.body ?? {});

      if (paymentType.paymentTypeId === 1) {
        await assignEmployeePaymentType(
          employeeId,
          paymentType.paymentTypeId,
          req.auth,
          paymentType.salaryAmount,
          undefined,
        );
      } else {
        await assignEmployeeRate(employeeId, paymentType.perOrderRate, req.auth);
      }

      sendCreated(res, { employeeId, paymentTypeId: paymentType.paymentTypeId });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const paymentMatch = path.match(EMPLOYEE_PAYMENT_PATH);
  if (paymentMatch && method === POST_METHOD) {
    try {
      const employeeId = validateEmployeeId(paymentMatch[1]);
      const payment = validateCreatePayment(req.body ?? {});

      await createPayment(
        employeeId,
        payment.amount,
        req.auth,
        payment.paymentPeriodLabel,
        payment.notes,
        payment.contractId,
      );
      sendCreated(res, { employeeId, amount: payment.amount });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  if (path === PAYROLL_PREVIEW_PATH && method === POST_METHOD) {
    try {
      const input = validatePayrollRunInput(req.body ?? {}) as PayrollRunInput;
      const result = await runPayrollPreview(input, req.auth);

      sendCreated(res, result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  if (path === PAYROLL_CREATE_PATH && method === POST_METHOD) {
    try {
      const input = validatePayrollRunInput(req.body ?? {}) as PayrollRunInput;
      const result = await runPayrollPreview(input, req.auth);

      sendCreated(res, result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  if (path === PAYROLL_LIST_PATH && method === GET_METHOD) {
    try {
      const status = validatePayrollRunStatus(req.query.status);
      const runs = await getPayrollRunsService(status, req.auth);
      sendSuccess(res, runs);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const payrollGetMatch = path.match(PAYROLL_GET_PATH);
  if (payrollGetMatch && method === GET_METHOD) {
    try {
      const payrollRunId = validatePayrollRunId(payrollGetMatch[1]);
      const run = await getPayrollRunByIdService(payrollRunId, req.auth);

      if (!run) {
        sendError(res, 404, "NOT_FOUND", "Payroll run not found");
        return;
      }

      sendSuccess(res, run);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const payrollConfirmMatch = path.match(PAYROLL_CONFIRM_PATH);
  if (payrollConfirmMatch && method === POST_METHOD) {
    try {
      const payrollRunId = validatePayrollRunId(payrollConfirmMatch[1]);
      const result = await confirmPayrollRun(payrollRunId, req.auth);
      sendSuccess(res, result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const payrollPaidMatch = path.match(PAYROLL_PAID_PATH);
  if (payrollPaidMatch && method === POST_METHOD) {
    try {
      const payrollRunId = validatePayrollRunId(payrollPaidMatch[1]);
      const result = await markPayrollRunAsPaid(payrollRunId, req.auth);
      sendSuccess(res, result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const payrollItemGetMatch = path.match(PAYROLL_ITEM_GET_PATH);
  if (payrollItemGetMatch && method === GET_METHOD) {
    try {
      const payrollRunItemId = validatePayrollRunItemId(payrollItemGetMatch[2]);
      const item = await getPayrollRunItemByIdService(payrollRunItemId, req.auth);
      if (!item) {
        sendError(res, 404, "NOT_FOUND", "Payroll run item not found");
        return;
      }
      sendSuccess(res, item);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const payrollItemConfirmMatch = path.match(PAYROLL_ITEM_CONFIRM_PATH);
  if (payrollItemConfirmMatch && method === POST_METHOD) {
    try {
      const payrollRunItemId = validatePayrollRunItemId(payrollItemConfirmMatch[2]);
      const result = await confirmPayrollItem(payrollRunItemId, req.auth);
      sendSuccess(res, result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const payrollItemPaidMatch = path.match(PAYROLL_ITEM_PAID_PATH);
  if (payrollItemPaidMatch && method === POST_METHOD) {
    try {
      const payrollRunItemId = validatePayrollRunItemId(payrollItemPaidMatch[2]);
      const result = await payPayrollItem(payrollRunItemId, req.auth);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
      return;
    }
  }

  if (path === EMPLOYEE_LIST_PATH && method === GET_METHOD) {
    try {
      const employees = await listEmployees(req.auth);
      sendSuccess(res, employees);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  const perfMatch = path.match(EMPLOYEE_PERF_PATH);
  if (perfMatch && method === GET_METHOD) {
    try {
      const employeeId = validateEmployeeId(perfMatch[1]);
      const query = validateEmployeePerformanceQuery(req.query);
      const perf = await getEmployeePerformanceService(
        employeeId,
        req.auth,
        query.days ?? 30,
      );
      sendSuccess(res, perf);
    } catch (error) {
      next(error);
      return;
    }
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
}