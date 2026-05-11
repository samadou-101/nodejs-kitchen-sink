import type { Request, Response, NextFunction } from "express";
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
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendError,
} from "@/modules/ecom/shared/response";

export async function orderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.params.id as string | undefined;

  if (req.path === "/order/create" && req.method === "POST") {
    try {
      const orderData = validateOrderData(req.body) as OrderData;
      const order = await placeOrder(orderData, req.auth);
      if (!order) {
        sendError(res, 400, "VALIDATION_ERROR", "Failed creating order");
        return;
      }
      const orderResponse: OrderDTO = {
        orderId: order.orderId,
        customerId: order.customerId,
        notes: order.notes,
        orderDate: order.orderDate,
        orderStatusId: order.orderStatusId,
      };
      sendCreated(res, orderResponse);
    } catch (error) {
      next(error);
      return;
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
      sendSuccess(res, orders);
    } catch (error) {
      next(error);
      return;
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
        sendSuccess(res, updated);
      } catch (error) {
        next(error);
        return;
      }
      return;
    }

    const employeeMatch = req.path.match(/^\/order\/(\d+)\/employee$/);
    if (employeeMatch) {
      try {
        const orderId = validateOrderId(employeeMatch[1]!);
        const { employeeId } = validateAssignEmployee(req.body);
        const updated = await assignOrderToEmployee(
          orderId,
          employeeId,
          req.auth,
        );
        sendSuccess(res, updated);
      } catch (error) {
        next(error);
        return;
      }
      return;
    }

    const unassignMatch = req.path.match(
      /^\/order\/(\d+)\/employee\/remove$/,
    );
    if (unassignMatch) {
      try {
        const orderId = validateOrderId(unassignMatch[1]!);
        const updated = await unassignEmployeeFromOrder(orderId, req.auth);
        sendSuccess(res, updated);
      } catch (error) {
        next(error);
        return;
      }
      return;
    }
  }

  if (id && req.method === "GET") {
    try {
      const orderId = validateOrderId(id);
      const order = await getOrderById(orderId, req.auth);
      if (!order) {
        sendError(res, 404, "NOT_FOUND", "Order not found");
        return;
      }
      sendSuccess(res, order);
    } catch (error) {
      next(error);
      return;
    }
    return;
  }

  if (id && req.method === "PATCH") {
    try {
      const orderId = validateOrderId(id);
      const orderData = validateOrderData(req.body) as OrderData;
      orderData.orderId = orderId;
      const updated = await updateOrder(orderData, req.auth);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
      return;
    }
    return;
  }

  if (id && req.method === "DELETE") {
    try {
      const orderId = validateOrderId(id);
      await deleteOrderById(orderId, req.auth);
      sendNoContent(res);
    } catch (error) {
      next(error);
      return;
    }
    return;
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
}
