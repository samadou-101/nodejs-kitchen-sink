import { adjustStock, getLowStock, getInventoryByProductId } from "../repo/inventory.repo";
import type { InventoryAdjustData } from "../repo/inventory.repo";

export async function adjustInventory(data: InventoryAdjustData) {
  return await adjustStock(data);
}

export async function getLowStockProducts(threshold = 10) {
  return await getLowStock(threshold);
}

export async function getProductInventory(productId: number) {
  return await getInventoryByProductId(productId);
}
