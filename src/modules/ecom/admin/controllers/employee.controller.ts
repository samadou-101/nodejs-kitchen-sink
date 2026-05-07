import type { Request, Response } from "express";
import {
  assignEmployeeRole,
  addEmployeeToPendingList,
} from "../services/employee.service";

export async function employeeAdminHandler(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;
  const POST_METHOD = "POST";
  const GET_METHOD = "GET";
  const EMPLOYEE_ACTIVATION_PATH = "/admin/employee/add";
  const LOGIN_PATH = "/admin/login";

  if (path === EMPLOYEE_ACTIVATION_PATH && method === POST_METHOD) {
    try {
      const { email } = req.body ?? null;
      console.log(email);
      if (!email) {
        res.status(400).send("Empty Data");
        return;
      }
      console.log(email, "after check");
      await addEmployeeToPendingList(email);
      res.status(201).send("Employee activated");
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
    return;
  }
}
