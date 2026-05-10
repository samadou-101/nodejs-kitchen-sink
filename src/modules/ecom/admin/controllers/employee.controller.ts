import type { Request, Response } from "express";
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
} from "../services/employee.service";
import type { PayrollRunStatus } from "../admin.types";
import { ForbiddenError, UnauthorizedError } from "@/modules/ecom/auth/errors";

function handleAuthError(res: Response, error: unknown) {
  if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: error.message });
    return true;
  }
  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return true;
  }
  return false;
}

export async function employeeAdminHandler(req: Request, res: Response) {
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

  const EMPLOYEE_PERF_PATH = /^\/admin\/employees\/(\d+)\/performance$/;

  if (path === EMPLOYEE_ACTIVATION_PATH && method === POST_METHOD) {
    try {
      const { email } = req.body ?? null;
      if (!email) {
        res.status(400).send("Empty Data");
        return;
      }
      await addEmployeeToPendingList(email, req.auth);
      res.status(201).send("Employee activated");
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const paymentTypeMatch = path.match(EMPLOYEE_PAYMENT_TYPE_PATH);
  if (paymentTypeMatch && method === POST_METHOD) {
    try {
      const employeeIdStr = paymentTypeMatch[1];
      if (!employeeIdStr) {
        res.status(400).send("Invalid employee ID");
        return;
      }
      const employeeId = parseInt(employeeIdStr, 10);
      const { paymentTypeId, salaryAmount, perOrderRate } = req.body ?? {};

      if (!employeeId || !paymentTypeId) {
        res.status(400).send("Missing required fields");
        return;
      }

      if (paymentTypeId === 1 && salaryAmount) {
        await assignEmployeePaymentType(
          employeeId,
          paymentTypeId,
          req.auth,
          salaryAmount,
          undefined,
        );
      } else if (paymentTypeId === 2 && perOrderRate) {
        await assignEmployeeRate(employeeId, perOrderRate, req.auth);
      } else {
        res.status(400).send(
          `${paymentTypeId === 1 && !salaryAmount ? "Invalid Salary amount" : "Invalid Per order amount"}`,
        );
        return;
      }

      res.status(201).json({ success: true, employeeId, paymentTypeId });
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const paymentMatch = path.match(EMPLOYEE_PAYMENT_PATH);
  if (paymentMatch && method === POST_METHOD) {
    try {
      const employeeIdStr = paymentMatch[1];
      if (!employeeIdStr) {
        res.status(400).send("Invalid employee ID");
        return;
      }
      const employeeId = parseInt(employeeIdStr, 10);
      const { amount, paymentPeriodLabel, notes, contractId } = req.body ?? {};

      if (!employeeId || !amount) {
        res.status(400).send("Missing required fields");
        return;
      }

      await createPayment(
        employeeId,
        amount,
        req.auth,
        paymentPeriodLabel,
        notes,
        contractId,
      );
      res.status(201).json({ success: true, employeeId, amount });
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  if (path === PAYROLL_PREVIEW_PATH && method === POST_METHOD) {
    try {
      const { startDate, endDate, employeeIds } = req.body ?? {};

      if (!startDate || !endDate) {
        res.status(400).send("Missing startDate or endDate");
        return;
      }

      const result = await runPayrollPreview(
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          employeeIds,
        },
        req.auth,
      );

      res.status(201).json(result);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  if (path === PAYROLL_CREATE_PATH && method === POST_METHOD) {
    try {
      const { startDate, endDate, employeeIds } = req.body ?? {};

      if (!startDate || !endDate) {
        res.status(400).send("Missing startDate or endDate");
        return;
      }

      const result = await runPayrollPreview(
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          employeeIds,
        },
        req.auth,
      );

      res.status(201).json(result);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  if (path === PAYROLL_LIST_PATH && method === GET_METHOD) {
    try {
      const { status } = req.query ?? {};
      const uppercasedStatus = status
        ? (status as string).toUpperCase()
        : undefined;
      const runs = await getPayrollRunsService(
        uppercasedStatus as PayrollRunStatus | undefined,
        req.auth,
      );
      res.status(200).json(runs);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const payrollGetMatch = path.match(PAYROLL_GET_PATH);
  if (payrollGetMatch && method === GET_METHOD) {
    try {
      const payrollRunIdStr = payrollGetMatch[1];
      if (!payrollRunIdStr) {
        res.status(400).send("Invalid payroll run ID");
        return;
      }
      const payrollRunId = parseInt(payrollRunIdStr, 10);
      const run = await getPayrollRunByIdService(payrollRunId, req.auth);

      if (!run) {
        res.status(404).send("Payroll run not found");
        return;
      }

      res.status(200).json(run);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const payrollConfirmMatch = path.match(PAYROLL_CONFIRM_PATH);
  if (payrollConfirmMatch && method === POST_METHOD) {
    try {
      const payrollRunIdStr = payrollConfirmMatch[1];
      if (!payrollRunIdStr) {
        res.status(400).send("Invalid payroll run ID");
        return;
      }
      const payrollRunId = parseInt(payrollRunIdStr, 10);
      const result = await confirmPayrollRun(payrollRunId, req.auth);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const payrollPaidMatch = path.match(PAYROLL_PAID_PATH);
  if (payrollPaidMatch && method === POST_METHOD) {
    try {
      const payrollRunIdStr = payrollPaidMatch[1];
      if (!payrollRunIdStr) {
        res.status(400).send("Invalid payroll run ID");
        return;
      }
      const payrollRunId = parseInt(payrollRunIdStr, 10);
      const result = await markPayrollRunAsPaid(payrollRunId, req.auth);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const payrollItemGetMatch = path.match(PAYROLL_ITEM_GET_PATH);
  if (payrollItemGetMatch && method === GET_METHOD) {
    try {
      const payrollRunItemIdStr = payrollItemGetMatch[2];
      if (!payrollRunItemIdStr) {
        res.status(400).send("Invalid payroll run item ID");
        return;
      }
      const payrollRunItemId = parseInt(payrollRunItemIdStr, 10);
      const item = await getPayrollRunItemByIdService(payrollRunItemId, req.auth);
      if (!item) {
        res.status(404).send("Payroll run item not found");
        return;
      }
      res.status(200).json(item);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const payrollItemConfirmMatch = path.match(PAYROLL_ITEM_CONFIRM_PATH);
  if (payrollItemConfirmMatch && method === POST_METHOD) {
    try {
      const payrollRunItemIdStr = payrollItemConfirmMatch[2];
      if (!payrollRunItemIdStr) {
        res.status(400).send("Invalid payroll run item ID");
        return;
      }
      const payrollRunItemId = parseInt(payrollRunItemIdStr, 10);
      const result = await confirmPayrollItem(payrollRunItemId, req.auth);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const payrollItemPaidMatch = path.match(PAYROLL_ITEM_PAID_PATH);
  if (payrollItemPaidMatch && method === POST_METHOD) {
    try {
      const payrollRunItemIdStr = payrollItemPaidMatch[2];
      if (!payrollRunItemIdStr) {
        res.status(400).send("Invalid payroll run item ID");
        return;
      }
      const payrollRunItemId = parseInt(payrollRunItemIdStr, 10);
      const result = await payPayrollItem(payrollRunItemId, req.auth);
      res.status(200).json(result);
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  const perfMatch = path.match(EMPLOYEE_PERF_PATH);
  if (perfMatch && method === GET_METHOD) {
    try {
      const employeeIdStr = perfMatch[1];
      if (!employeeIdStr) {
        res.status(400).send("Invalid employee ID");
        return;
      }
      const employeeId = parseInt(employeeIdStr, 10);
      const days = req.query.days
        ? parseInt(req.query.days as string, 10)
        : 30;
      const perf = await getEmployeePerformanceService(
        employeeId,
        req.auth,
        days,
      );
      res.status(200).json(perf);
    } catch (error) {
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }
}