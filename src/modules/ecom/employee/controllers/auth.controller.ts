import type { Request, Response } from "express";
import { z } from "zod";
import { loginEmployee, registerEmployee } from "../services/auth.service";
import type { EmployeeRequestData } from "../employee.types";
import { Prisma } from "@/generated/prisma/client";
import {
  validateEmployeeLogin,
} from "@/modules/ecom/validation/validators/employee.validator";

export async function employeeAuthController(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;
  const POST_METHOD = "POST";
  const REGISTRATION_PATH = "/employee/signup";
  const LOGIN_PATH = "/employee/login";

  console.log("employee auth controller hit");
  if (path === REGISTRATION_PATH && method === POST_METHOD) {
    try {
      const employeeData = req.body as EmployeeRequestData;

      if (!employeeData || Object.keys(employeeData).length === 0) {
        res.status(400).send("Invalid Data");
        return;
      }

      const { employee, sessionData } = await registerEmployee(employeeData);
      if (!employee || !sessionData) {
        res.status(400).send("Something went Wrong");
        return;
      }
      res.cookie("sid", sessionData?.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.status(201).send({ name: employee.name, email: employeeData.email });
      return;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res.send("User Already Exists (note: bad for security)");
          return;
        }
        res.send(error.message);
      }
      res.status(500).send(error.message);
    }
  }

  if (path === LOGIN_PATH && method === POST_METHOD) {
    try {
      const loginData = validateEmployeeLogin(req.body ?? {});
      const { name, email, sessionData } = await loginEmployee(loginData);
      res.cookie("sid", sessionData?.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.status(200).send({ name, email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  }
}