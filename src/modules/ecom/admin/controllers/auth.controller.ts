import type { Request, Response } from "express";
import { loginAdmin, registerAdmin } from "../services/auth.service";
import type { AdminData } from "../admin.types";
import { Prisma } from "@/generated/prisma/client";

export async function adminAuthController(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;
  const POST_METHOD = "POST";
  const GET_METHOD = "GET";
  const REGISTRATION_PATH = "/admin/register";
  const LOGIN_PATH = "/admin/login";

  if (path === REGISTRATION_PATH && method === POST_METHOD) {
    try {
      const adminData = req.body as AdminData;

      if (!adminData || Object.keys(adminData).length === 0) {
        res.status(400).send("Invalid Data");
        return;
      }

      const { admin, sessionData } = await registerAdmin(adminData);
      if (!admin || !sessionData) {
        res.status(400).send("Something went Wrong");
        return;
      }
      res.cookie("sid", sessionData?.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.status(201).send({ name: admin.name, email: admin.email });
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

  if (path === LOGIN_PATH && method === GET_METHOD) {
    try {
      const loginData = req.body ?? {};
      if (!loginData || Object.keys(loginData).length === 0) {
        res.status(400).send("Invalid Credentials");
        return;
      }
      const { name, email, sessionData } = await loginAdmin(loginData);
      res.cookie("sid", sessionData?.sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.status(200).send({ name, email });
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  }
}
