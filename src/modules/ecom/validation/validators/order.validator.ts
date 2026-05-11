import { z } from "zod";
import {
  OrderDataSchema,
  OrderFilterSchema,
  OrderStatusUpdateSchema,
  AssignEmployeeSchema,
  type OrderData,
  type OrderFilter,
  type OrderStatusUpdate,
  type AssignEmployeeData,
} from "../schemas/order.schema";

export function validateOrderData(data: unknown): OrderData {
  return OrderDataSchema.parse(data);
}

export function validateOrderId(id: unknown): number {
  return z.coerce.number().int().positive("Order ID must be a positive integer").parse(id);
}

export function validateOrderFilter(data: unknown): OrderFilter {
  return OrderFilterSchema.parse(data);
}

export function validateOrderStatusUpdate(data: unknown): OrderStatusUpdate {
  return OrderStatusUpdateSchema.parse(data);
}

export function validateAssignEmployee(data: unknown): AssignEmployeeData {
  return AssignEmployeeSchema.parse(data);
}
