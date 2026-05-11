import type { Request, Response, NextFunction } from "express";
import { loginEmployee, registerEmployee } from "../services/auth.service";
import type { EmployeeRequestData } from "../employee.types";
import { sendCreated, sendSuccess, sendError } from "@/modules/ecom/shared/response";
import { validateEmployeeLogin } from "@/modules/ecom/validation/validators/employee.validator";

export async function employeeAuthController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = req.path;
  const method = req.method;
  const REGISTRATION_PATH = "/employee/signup";
  const LOGIN_PATH = "/employee/login";

  if (path === REGISTRATION_PATH && method === "POST") {
    try {
      const employeeData = req.body as EmployeeRequestData;

      if (!employeeData || Object.keys(employeeData).length === 0) {
        sendError(res, 400, "VALIDATION_ERROR", "Invalid Data");
        return;
      }

      const { employee, sessionData } = await registerEmployee(employeeData);
      if (!employee || !sessionData) {
        sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
        return;
      }
      res.cookie("sid", sessionData.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      sendCreated(res, { name: employee.name, email: employeeData.email });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  if (path === LOGIN_PATH && method === "POST") {
    try {
      const loginData = validateEmployeeLogin(req.body ?? {});
      const { name, email, sessionData } = await loginEmployee(loginData);
      res.cookie("sid", sessionData?.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      sendSuccess(res, { name, email });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}
