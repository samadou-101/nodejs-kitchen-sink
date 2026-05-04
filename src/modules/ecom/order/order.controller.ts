import type { Request, Response } from "express";
import { placeOrder } from "./order.service";
import type { OrderData, OrderDTO } from "./order.types";

export async function orderHnadler(req: Request, res: Response) {
  if (req.path === "/order/create" && req.method === "POST") {
    const orderData = req.body as OrderData;
    try {
      const order = await placeOrder(orderData);
      if (!order) {
        res.status(404).send("Failed crating order");
        return;
      }
      const orderResponse: Omit<OrderDTO, "orderStatusId"> = {
        orderId: order.orderId,
        customerId: order.customerId,
        notes: order.notes,
        orderDate: order.orderDate,
      };
      res.status(201).send(orderResponse);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }

  if (req.path === "/order" && req.params.id && req.method === "GET") {
  }

  if (req.path.startsWith("/order") && req.params.id && req.method === "GET") {
  }

  if (
    req.path.startsWith("/order") &&
    req.params.id &&
    req.method === "PATCH"
  ) {
  }

  if (
    req.path.startsWith("/order") &&
    req.params.id &&
    req.method === "DELETE"
  ) {
  }
}
