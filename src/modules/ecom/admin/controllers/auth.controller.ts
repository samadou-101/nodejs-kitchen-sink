import type { Request, Response, NextFunction } from "express";
import { loginAdmin, registerAdmin } from "../services/auth.service";
import type { AdminData } from "../admin.types";
import { sendCreated, sendSuccess, sendError } from "@/modules/ecom/shared/response";

export async function adminAuthController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = req.path;
  const method = req.method;
  const REGISTRATION_PATH = "/admin/signup";
  const LOGIN_PATH = "/admin/login";

  if (path === REGISTRATION_PATH && method === "POST") {
    try {
      const adminData = req.body as AdminData;

      if (!adminData || Object.keys(adminData).length === 0) {
        sendError(res, 400, "VALIDATION_ERROR", "Invalid Data");
        return;
      }

      const { admin, sessionData } = await registerAdmin(adminData);
      if (!admin || !sessionData) {
        sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
        return;
      }
      res.cookie("sid", sessionData.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      sendCreated(res, { name: admin.name, email: admin.email });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  if (path === LOGIN_PATH && method === "POST") {
    try {
      const loginData = req.body ?? {};
      if (!loginData || Object.keys(loginData).length === 0) {
        sendError(res, 400, "VALIDATION_ERROR", "Invalid Credentials");
        return;
      }
      const { name, email, sessionData } = await loginAdmin(loginData);
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
