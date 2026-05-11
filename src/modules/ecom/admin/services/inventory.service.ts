import { prisma } from "@/config/db.config";
import {
  adjustStock,
  getLowStock,
  getInventoryByProductId,
} from "../repo/inventory.repo";
import type { InventoryAdjustData } from "../repo/inventory.repo";
import { authorize } from "@/modules/ecom/auth";
import { ProductPolicies } from "@/modules/ecom/auth/policies";
import { assertAuth } from "@/modules/ecom/auth/errors";

export async function adjustInventory(
  data: InventoryAdjustData,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.manageInventory());

  return await prisma.$transaction(async (tx) => {
    return await adjustStock(data);
  });
}

export async function getLowStockProducts(
  threshold = 10,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.viewInventory());
  return await getLowStock(threshold);
}

export async function getProductInventory(
  productId: number,
  auth: unknown,
) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.viewInventory());
  return await getInventoryByProductId(productId);
}