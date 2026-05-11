import { z } from "zod";

export const OrderCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
});

export type OrderCustomer = z.infer<typeof OrderCustomerSchema>;

export const OrderItemSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  orderItemId: z.number().int().positive().optional(),
});

export type OrderItemSchemaType = z.infer<typeof OrderItemSchema>;

export const OrderDataSchema = z.object({
  orderId: z.number().int().positive().optional(),
  customer: OrderCustomerSchema,
  orderItems: z.array(OrderItemSchema).min(1, "At least one order item is required"),
  orderDate: z.coerce.date("Invalid order date"),
  orderStatusId: z.number().int().positive("Order status ID must be a positive integer"),
  employeeId: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type OrderData = z.infer<typeof OrderDataSchema>;

export const OrderFilterSchema = z.object({
  statusId: z.coerce.number().int().positive().optional(),
  employeeId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100, "Limit cannot exceed 100").optional().default(20),
});

export type OrderFilter = z.infer<typeof OrderFilterSchema>;

export const OrderStatusUpdateSchema = z.object({
  statusId: z.number().int().positive("Status ID must be a positive integer"),
});

export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;

export const AssignEmployeeSchema = z.object({
  employeeId: z.number().int().positive("Employee ID must be a positive integer"),
});

export type AssignEmployeeData = z.infer<typeof AssignEmployeeSchema>;
