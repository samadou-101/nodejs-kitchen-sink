import type { Request, Response } from "express";
import { placeOrder } from "./order.service";
import type { OrderData } from "./order.types";

export async function orderHnadler(req: Request, res: Response) {
  if (req.path === "/order/create" && req.method === "POST") {
    const orderData = req.body as OrderData;
    try {
      const order = await placeOrder(orderData);
      if (!order) {
        res.status(404).send("Failed crating order");
        return;
      }
      res.status(201).send(order);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
}
