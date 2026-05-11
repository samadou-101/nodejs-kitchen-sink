import type { Request, Response } from "express";
import { z } from "zod";
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
import type { PayrollRunInput } from "../admin.types";
import { ForbiddenError, UnauthorizedError } from "@/modules/ecom/auth/errors";
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
      const { email } = validateEmail(req.body ?? {});
      await addEmployeeToPendingList(email, req.auth);
      res.status(201).send("Employee activated");
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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

      res.status(201).json({ success: true, employeeId, paymentTypeId: paymentType.paymentTypeId });
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      res.status(201).json({ success: true, employeeId, amount: payment.amount });
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  if (path === PAYROLL_PREVIEW_PATH && method === POST_METHOD) {
    try {
      const input = validatePayrollRunInput(req.body ?? {}) as PayrollRunInput;
      const result = await runPayrollPreview(input, req.auth);

      res.status(201).json(result);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  if (path === PAYROLL_CREATE_PATH && method === POST_METHOD) {
    try {
      const input = validatePayrollRunInput(req.body ?? {}) as PayrollRunInput;
      const result = await runPayrollPreview(input, req.auth);

      res.status(201).json(result);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }

  if (path === PAYROLL_LIST_PATH && method === GET_METHOD) {
    try {
      const status = validatePayrollRunStatus(req.query.status);
      const runs = await getPayrollRunsService(status, req.auth);
      res.status(200).json(runs);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const payrollRunId = validatePayrollRunId(payrollGetMatch[1]);
      const run = await getPayrollRunByIdService(payrollRunId, req.auth);

      if (!run) {
        res.status(404).send("Payroll run not found");
        return;
      }

      res.status(200).json(run);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const payrollRunId = validatePayrollRunId(payrollConfirmMatch[1]);
      const result = await confirmPayrollRun(payrollRunId, req.auth);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const payrollRunId = validatePayrollRunId(payrollPaidMatch[1]);
      const result = await markPayrollRunAsPaid(payrollRunId, req.auth);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const payrollRunItemId = validatePayrollRunItemId(payrollItemGetMatch[2]);
      const item = await getPayrollRunItemByIdService(payrollRunItemId, req.auth);
      if (!item) {
        res.status(404).send("Payroll run item not found");
        return;
      }
      res.status(200).json(item);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const payrollRunItemId = validatePayrollRunItemId(payrollItemConfirmMatch[2]);
      const result = await confirmPayrollItem(payrollRunItemId, req.auth);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const payrollRunItemId = validatePayrollRunItemId(payrollItemPaidMatch[2]);
      const result = await payPayrollItem(payrollRunItemId, req.auth);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
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
      const employeeId = validateEmployeeId(perfMatch[1]);
      const query = validateEmployeePerformanceQuery(req.query);
      const perf = await getEmployeePerformanceService(
        employeeId,
        req.auth,
        query.days ?? 30,
      );
      res.status(200).json(perf);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).send("Something went wrong");
      }
    }
    return;
  }
}