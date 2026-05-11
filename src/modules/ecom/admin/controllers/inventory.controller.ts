import type { Request, Response, NextFunction } from "express";
import {
  adjustInventory,
  getLowStockProducts,
} from "../services/inventory.service";
import {
  validateInventoryAdjust,
  validateThreshold,
} from "@/modules/ecom/validation/validators/inventory.validator";
import { sendSuccess, sendError } from "@/modules/ecom/shared/response";

export async function inventoryAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = req.path;
  const method = req.method;

  if (path === "/admin/inventory/adjust" && method === "POST") {
    try {
      const { productId, action, amount } = validateInventoryAdjust(
        req.body ?? {},
      );
      await adjustInventory({ productId, action, amount }, req.auth);
      sendSuccess(res, { message: "Stock adjusted successfully" });
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  if (path === "/admin/inventory/low-stock" && method === "GET") {
    try {
      const threshold = validateThreshold(req.query.threshold) ?? 10;
      const products = await getLowStockProducts(threshold, req.auth);
      sendSuccess(res, products);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
}
