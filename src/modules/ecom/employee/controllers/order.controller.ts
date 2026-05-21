import type { Request, Response, NextFunction } from "express";
import {
  getAssignedOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  addOrderNotes,
} from "../services/order.service";
import { validateOrderNote } from "@/modules/ecom/validation/validators/employee.validator";
import {
  sendSuccess,
  sendError,
} from "@/modules/ecom/shared/response";

export async function employeeOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = req.path;
  const method = req.method;

  if (path === "/employee/orders" && method === "GET") {
    const employeeId = req.auth?.employeeId;
    if (!employeeId) {
      sendError(res, 400, "VALIDATION_ERROR", "employeeId is required");
      return;
    }
    try {
      const orders = await getAssignedOrders(employeeId, req.auth);
      sendSuccess(res, orders);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  const orderByIdMatch = path.match(/^\/employee\/orders\/(\d+)$/);
  if (orderByIdMatch && method === "GET") {
    try {
      const orderId = parseInt(orderByIdMatch[1]!, 10);
      if (isNaN(orderId)) {
        sendError(res, 400, "VALIDATION_ERROR", "Invalid order ID");
        return;
      }
      const order = await getOrderById(orderId, req.auth);
      if (!order) {
        sendError(res, 404, "NOT_FOUND", "Order not found");
        return;
      }
      sendSuccess(res, order);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  const confirmMatch = path.match(/^\/employee\/orders\/(\d+)\/confirm$/);
  if (confirmMatch && method === "PATCH") {
    try {
      const orderId = parseInt(confirmMatch[1]!, 10);
      const order = await confirmOrder(orderId, req.auth);
      sendSuccess(res, { message: "Order confirmed", order });
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  const rejectMatch = path.match(/^\/employee\/orders\/(\d+)\/reject$/);
  if (rejectMatch && method === "PATCH") {
    try {
      const orderId = parseInt(rejectMatch[1]!, 10);
      const order = await rejectOrder(orderId, req.auth);
      sendSuccess(res, { message: "Order rejected", order });
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  const notesMatch = path.match(/^\/employee\/orders\/(\d+)\/notes$/);
  if (notesMatch && method === "POST") {
    try {
      const orderId = parseInt(notesMatch[1]!, 10);
      const { notes } = validateOrderNote(req.body ?? {});
      const order = await addOrderNotes(orderId, notes, req.auth);
      sendSuccess(res, { message: "Notes added", order });
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
}
