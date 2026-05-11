import type { Request, Response } from "express";
import { z } from "zod";
import {
  getAssignedOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  addOrderNotes,
} from "../services/order.service";
import { ForbiddenError, UnauthorizedError } from "@/modules/ecom/auth/errors";
import {
  validateOrderNote,
} from "@/modules/ecom/validation/validators/employee.validator";

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

export async function employeeOrderHandler(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;

  if (path === "/employee/orders" && method === "GET") {
    const employeeId = req.query.employeeId as string;
    if (!employeeId) {
      res.status(400).json({ message: "employeeId is required" });
      return;
    }
    try {
      const orders = await getAssignedOrders(Number(employeeId), req.auth);
      res.status(200).json(orders);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        console.error(error);
        res.status(500).json({ message: (error as Error).message });
      }
    }
    return;
  }

  const orderByIdMatch = path.match(/^\/employee\/orders\/(\d+)$/);
  if (orderByIdMatch && method === "GET") {
    try {
      const orderId = parseInt(orderByIdMatch[1]!, 10);
      if (isNaN(orderId)) {
        res.status(400).json({ message: "Invalid order ID" });
        return;
      }
      const order = await getOrderById(orderId, req.auth);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        res.status(500).json({ message: (error as Error).message });
      }
    }
    return;
  }

  const confirmMatch = path.match(/^\/employee\/orders\/(\d+)\/confirm$/);
  if (confirmMatch && method === "PATCH") {
    try {
      const orderId = parseInt(confirmMatch[1]!, 10);
      const order = await confirmOrder(orderId, req.auth);
      res.status(200).json({ message: "Order confirmed", order });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        res.status(500).json({ message: (error as Error).message });
      }
    }
    return;
  }

  const rejectMatch = path.match(/^\/employee\/orders\/(\d+)\/reject$/);
  if (rejectMatch && method === "PATCH") {
    try {
      const orderId = parseInt(rejectMatch[1]!, 10);
      const order = await rejectOrder(orderId, req.auth);
      res.status(200).json({ message: "Order rejected", order });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        res.status(500).json({ message: (error as Error).message });
      }
    }
    return;
  }

  const notesMatch = path.match(/^\/employee\/orders\/(\d+)\/notes$/);
  if (notesMatch && method === "POST") {
    try {
      const orderId = parseInt(notesMatch[1]!, 10);
      const { notes } = validateOrderNote(req.body ?? {});
      const order = await addOrderNotes(orderId, notes, req.auth);
      res.status(200).json({ message: "Notes added", order });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        res.status(500).json({ message: (error as Error).message });
      }
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}