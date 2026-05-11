import type { Request, Response } from "express";
import { z } from "zod";
import {
  placeOrder,
  getOrderById,
  updateOrder,
  deleteOrderById,
  updateOrderStatus,
  assignOrderToEmployee,
  unassignEmployeeFromOrder,
  listOrders,
  trackOrdersByPhone,
} from "./order.service";
import type { OrderData, OrderDTO } from "./order.types";
import {
  validateOrderData,
  validateOrderId,
  validateOrderFilter,
  validateOrderStatusUpdate,
  validateAssignEmployee,
} from "@/modules/ecom/validation/validators/order.validator";
import { handleError } from "./order.utils";
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

export async function orderHandler(req: Request, res: Response) {
  const id = req.params.id as string | undefined;

  if (req.path === "/order/create" && req.method === "POST") {
    try {
      const orderData = validateOrderData(req.body) as OrderData;
      const order = await placeOrder(orderData, req.auth);
      if (!order) {
        res.status(400).json({ message: "Failed creating order" });
        return;
      }
      const orderResponse: OrderDTO = {
        orderId: order.orderId,
        customerId: order.customerId,
        notes: order.notes,
        orderDate: order.orderDate,
        orderStatusId: order.orderStatusId,
      };
      res.status(201).json(orderResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        handleError(res, error);
      }
    }
    return;
  }

  if (req.path === "/orders" && req.method === "GET") {
    try {
      const filter = validateOrderFilter(req.query) as {
        statusId?: number;
        employeeId?: number;
        page?: number;
        limit?: number;
      };
      const orders = await listOrders(filter, req.auth);
      res.status(200).json(orders);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        handleError(res, error);
      }
    }
    return;
  }

  if (req.path.startsWith("/order/") && req.method === "PATCH") {
    const statusMatch = req.path.match(/^\/order\/(\d+)\/status$/);
    if (statusMatch) {
      try {
        const orderId = validateOrderId(statusMatch[1]!);
        const { statusId } = validateOrderStatusUpdate(req.body);
        const updated = await updateOrderStatus(orderId, statusId, req.auth);
        res.status(200).json(updated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ error: "Validation failed", details: error.issues });
          return;
        }
        if (!handleAuthError(res, error)) {
          handleError(res, error);
        }
      }
      return;
    }

    const employeeMatch = req.path.match(/^\/order\/(\d+)\/employee$/);
    if (employeeMatch) {
      try {
        const orderId = validateOrderId(employeeMatch[1]!);
        const { employeeId } = validateAssignEmployee(req.body);
        const updated = await assignOrderToEmployee(orderId, employeeId, req.auth);
        res.status(200).json(updated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ error: "Validation failed", details: error.issues });
          return;
        }
        if (!handleAuthError(res, error)) {
          handleError(res, error);
        }
      }
      return;
    }

    const unassignMatch = req.path.match(/^\/order\/(\d+)\/employee\/remove$/);
    if (unassignMatch) {
      try {
        const orderId = validateOrderId(unassignMatch[1]!);
        const updated = await unassignEmployeeFromOrder(orderId, req.auth);
        res.status(200).json(updated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ error: "Validation failed", details: error.issues });
          return;
        }
        if (!handleAuthError(res, error)) {
          handleError(res, error);
        }
      }
      return;
    }
  }

  if (id && req.method === "GET") {
    try {
      const orderId = validateOrderId(id);
      const order = await getOrderById(orderId, req.auth);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        handleError(res, error);
      }
    }
    return;
  }

  if (id && req.method === "PATCH") {
    try {
      const orderId = validateOrderId(id);
      const orderData = validateOrderData(req.body) as OrderData;
      orderData.orderId = orderId;
      const updated = await updateOrder(orderData, req.auth);
      res.status(200).json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        handleError(res, error);
      }
    }
    return;
  }

  if (id && req.method === "DELETE") {
    try {
      const orderId = validateOrderId(id);
      await deleteOrderById(orderId, req.auth);
      res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        handleError(res, error);
      }
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}