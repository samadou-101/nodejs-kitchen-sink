import { insertOrder } from "./order.repo";
import type { OrderData } from "./order.types";

export async function placeOrder(orderData: OrderData) {
  return await insertOrder(orderData);
}
