import type { Request, Response } from "express";
import { z } from "zod";
import {
  adjustInventory,
  getLowStockProducts,
} from "../services/inventory.service";
import { ForbiddenError, UnauthorizedError } from "@/modules/ecom/auth/errors";
import {
  validateInventoryAdjust,
  validateThreshold,
} from "@/modules/ecom/validation/validators/inventory.validator";

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
      const { productId, action, amount } = validateInventoryAdjust(req.body ?? {});
      await adjustInventory({ productId, action, amount }, req.auth);
      res.status(200).json({ message: "Stock adjusted successfully" });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        res.status(400).json({ message: (error as Error).message });
      }
    }
    return;
  }

  if (path === "/admin/inventory/low-stock" && method === "GET") {
    try {
      const threshold = validateThreshold(req.query.threshold) ?? 10;
      const products = await getLowStockProducts(threshold, req.auth);
      res.status(200).json(products);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      if (!handleAuthError(res, error)) {
        res.status(500).json({ message: (error as Error).message });
      }
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}
