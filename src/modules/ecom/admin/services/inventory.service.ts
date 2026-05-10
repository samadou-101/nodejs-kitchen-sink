import { prisma } from "@/config/db.config";
import {
  adjustStock,
  getLowStock,
  getInventoryByProductId,
} from "../repo/inventory.repo";
import type { InventoryAdjustData } from "../repo/inventory.repo";
import { enforceManageInventory, enforceUpdateInventory, enforceViewInventory } from "@/modules/ecom/auth";
import { assertAuth, checkAuthz } from "@/modules/ecom/auth/errors";

export async function adjustInventory(
  data: InventoryAdjustData,
  auth: unknown,
) {
  assertAuth(auth);
  const manageResult = enforceManageInventory(auth as any);
  checkAuthz(manageResult);

  const updateResult = enforceUpdateInventory(auth as any);
  checkAuthz(updateResult);

  return await prisma.$transaction(async (tx) => {
    return await adjustStock(data);
  });
}

export async function getLowStockProducts(
  threshold = 10,
  auth: unknown,
) {
  assertAuth(auth);
  const result = enforceViewInventory(auth as any);
  checkAuthz(result);
  return await getLowStock(threshold);
}

export async function getProductInventory(
  productId: number,
  auth: unknown,
) {
  assertAuth(auth);
  const result = enforceViewInventory(auth as any);
  checkAuthz(result);
  return await getInventoryByProductId(productId);
}