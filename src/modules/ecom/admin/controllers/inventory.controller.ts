import type { Request, Response } from "express";
import {
  adjustInventory,
  getLowStockProducts,
} from "../services/inventory.service";
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

export async function inventoryAdminHandler(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;

  if (path === "/admin/inventory/adjust" && method === "POST") {
    try {
      const { productId, action, amount } = req.body as {
        productId: number;
        action: "increase" | "decrease";
        amount: number;
      };
      if (!productId || !action || amount === undefined) {
        res.status(400).json({ message: "productId, action, and amount are required" });
        return;
      }
      if (!["increase", "decrease"].includes(action)) {
        res.status(400).json({ message: "action must be 'increase' or 'decrease'" });
        return;
      }
      await adjustInventory({ productId, action, amount }, req.auth);
      res.status(200).json({ message: "Stock adjusted successfully" });
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(400).json({ message: error.message });
      }
    }
    return;
  }

  if (path === "/admin/inventory/low-stock" && method === "GET") {
    try {
      const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
      const products = await getLowStockProducts(threshold);
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}
