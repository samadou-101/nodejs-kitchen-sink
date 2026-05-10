import { prisma } from "@/config/db.config";

export type InventoryAdjustData = {
  productId: number;
  action: "increase" | "decrease";
  amount: number;
};

export async function adjustStock(data: InventoryAdjustData) {
  return prisma.$transaction(async (tx) => {
    if (data.action === "decrease") {
      const result = await tx.inventory.updateMany({
        where: {
          productId: data.productId,
          quantityAvailable: { gte: data.amount },
        },
        data: { quantityAvailable: { decrement: data.amount } },
      });
      if (result.count === 0) {
        const inv = await tx.inventory.findUnique({
          where: { productId: data.productId },
        });
        throw new Error(
          `Insufficient stock for product ${data.productId}: available ${inv?.quantityAvailable ?? 0}`,
        );
      }
      return result;
    }
    const result = await tx.inventory.updateMany({
      where: { productId: data.productId },
      data: { quantityAvailable: { increment: data.amount } },
    });
    if (result.count === 0) {
      throw new Error(`Product ${data.productId} not found in inventory`);
    }
    return result;
  });
}

export async function getLowStock(threshold = 10) {
  return prisma.inventory.findMany({
    where: { quantityAvailable: { lte: threshold } },
    include: {
      product: {
        select: { productId: true, name: true, price: true },
      },
    },
    orderBy: { quantityAvailable: "asc" },
  });
}

export async function getInventoryByProductId(productId: number) {
  return prisma.inventory.findUnique({
    where: { productId },
    include: { product: true },
  });
}
