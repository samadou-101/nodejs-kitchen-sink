import { z } from "zod";
import {
  CheckoutDataSchema,
  CartItemSchema,
  PhoneSchema,
  TrackingOrderIdSchema,
  SearchQuerySchema,
  type CheckoutData,
  type CartItem,
} from "../schemas/customer.schema";

export function validateCheckoutData(data: unknown): CheckoutData {
  return CheckoutDataSchema.parse(data);
}

export function validateCartItem(data: unknown): CartItem {
  return CartItemSchema.parse(data);
}

export function validatePhone(phone: unknown): string {
  return PhoneSchema.parse(phone);
}

export function validateTrackingOrderId(id: unknown): number {
  return TrackingOrderIdSchema.parse(id);
}

export function validateSearchQuery(query: unknown): string {
  return SearchQuerySchema.parse(query);
}
