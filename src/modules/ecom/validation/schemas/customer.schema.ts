import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CheckoutDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  notes: z.string().optional(),
  items: z.array(CartItemSchema).min(1, "At least one item is required"),
});

export type CheckoutData = z.infer<typeof CheckoutDataSchema>;

export const PhoneSchema = z.string().min(1, "Phone is required");

export const TrackingOrderIdSchema = z.coerce.number().int().positive();

export const SearchQuerySchema = z.string().min(1, "Search query is required");
