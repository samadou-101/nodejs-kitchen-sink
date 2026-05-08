import type { Request, Response } from "express";
import {
  assignEmployeePaymentType,
  assignEmployeeRate,
  assignEmployeeRole,
  addEmployeeToPendingList,
  createPayment,
  updateEmployeeSalary,
  getPayrollRunsService,
  getPayrollRunByIdService,
  confirmPayrollRun,
  markPayrollRunAsPaid,
  runPayrollPreview,
} from "../services/employee.service";
import type { PayrollRunStatus } from "../admin.types";

export async function employeeAdminHandler(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;
  const POST_METHOD = "POST";
  const GET_METHOD = "GET";

  // Employee paths
  const EMPLOYEE_ACTIVATION_PATH = "/admin/employee/add";
  const EMPLOYEE_PAYMENT_TYPE_PATH =
    /^\/admin\/employees\/(\d+)\/payment-type$/;
  const EMPLOYEE_PAYMENT_PATH = /^\/admin\/employees\/(\d+)\/payments$/;

  // Payroll paths
  const PAYROLL_PREVIEW_PATH = "/admin/payroll/preview";
  const PAYROLL_CREATE_PATH = "/admin/payroll";
  const PAYROLL_LIST_PATH = "/admin/payroll";
  const PAYROLL_GET_PATH = /^\/admin\/payroll\/(\d+)$/;
  const PAYROLL_CONFIRM_PATH = /^\/admin\/payroll\/(\d+)\/confirm$/;
  const PAYROLL_PAID_PATH = /^\/admin\/payroll\/(\d+)\/paid$/;

  // Employee Activation
  if (path === EMPLOYEE_ACTIVATION_PATH && method === POST_METHOD) {
    try {
      const { email } = req.body ?? null;
      if (!email) {
        res.status(400).send("Empty Data");
        return;
      }
      await addEmployeeToPendingList(email);
      res.status(201).send("Employee activated");
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Employee Payment Type (salary or per-order rate)
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
          salaryAmount,
        );
      } else if (paymentTypeId === 2 && perOrderRate) {
        await assignEmployeeRate(employeeId, perOrderRate);
      } else {
        res
          .status(400)
          .send(
            `${paymentTypeId === 1 && !salaryAmount ? "Invalid Salary amount" : "Invalid Per order amount"}`,
          );
        return;
      }

      res.status(201).json({ success: true, employeeId, paymentTypeId });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Employee Manual Payment
  const paymentMatch = path.match(EMPLOYEE_PAYMENT_PATH);
  if (paymentMatch && method === POST_METHOD) {
    try {
      const employeeIdStr = paymentMatch[1];
      if (!employeeIdStr) {
        res.status(400).send("Invalid employee ID");
        return;
      }
      const employeeId = parseInt(employeeIdStr, 10);
      const { amount, paymentPeriod, notes, contractId } = req.body ?? {};

      if (!employeeId || !amount) {
        res.status(400).send("Missing required fields");
        return;
      }

      await createPayment(employeeId, amount, paymentPeriod, notes, contractId);
      res.status(201).json({ success: true, employeeId, amount });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Payroll Preview
  if (path === PAYROLL_PREVIEW_PATH && method === POST_METHOD) {
    try {
      const { startDate, endDate, employeeIds } = req.body ?? {};

      if (!startDate || !endDate) {
        res.status(400).send("Missing startDate or endDate");
        return;
      }

      const result = await runPayrollPreview({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        employeeIds,
      });

      res.status(201).json(result);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Payroll Create (DRAFT run)
  if (path === PAYROLL_CREATE_PATH && method === POST_METHOD) {
    try {
      const { startDate, endDate, employeeIds } = req.body ?? {};

      if (!startDate || !endDate) {
        res.status(400).send("Missing startDate or endDate");
        return;
      }

      const result = await runPayrollPreview({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        employeeIds,
      });

      res.status(201).json(result);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Payroll List
  if (path === PAYROLL_LIST_PATH && method === GET_METHOD) {
    try {
      const { status } = req.query ?? {};
      const uppercasedStatus = status
        ? (status as string).toUpperCase()
        : undefined;
      const runs = await getPayrollRunsService(
        uppercasedStatus as PayrollRunStatus | undefined,
      );
      res.status(200).json(runs);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Payroll Get by ID
  const payrollGetMatch = path.match(PAYROLL_GET_PATH);
  if (payrollGetMatch && method === GET_METHOD) {
    try {
      const payrollRunIdStr = payrollGetMatch[1];
      if (!payrollRunIdStr) {
        res.status(400).send("Invalid payroll run ID");
        return;
      }
      const payrollRunId = parseInt(payrollRunIdStr, 10);
      const run = await getPayrollRunByIdService(payrollRunId);

      if (!run) {
        res.status(404).send("Payroll run not found");
        return;
      }

      res.status(200).json(run);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Payroll Confirm
  const payrollConfirmMatch = path.match(PAYROLL_CONFIRM_PATH);
  if (payrollConfirmMatch && method === POST_METHOD) {
    try {
      const payrollRunIdStr = payrollConfirmMatch[1];
      if (!payrollRunIdStr) {
        res.status(400).send("Invalid payroll run ID");
        return;
      }
      const payrollRunId = parseInt(payrollRunIdStr, 10);
      const result = await confirmPayrollRun(payrollRunId);
      res.status(200).json(result);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }

  // Payroll Mark as Paid
  const payrollPaidMatch = path.match(PAYROLL_PAID_PATH);
  if (payrollPaidMatch && method === POST_METHOD) {
    try {
      const payrollRunIdStr = payrollPaidMatch[1];
      if (!payrollRunIdStr) {
        res.status(400).send("Invalid payroll run ID");
        return;
      }
      const payrollRunId = parseInt(payrollRunIdStr, 10);
      const result = await markPayrollRunAsPaid(payrollRunId);
      res.status(200).json(result);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }
}
