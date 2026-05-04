import { prisma } from "@/config/db.config";
import type { ProductData } from "./product.types";

export async function insertProduct(data: ProductData) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description || null,
        category: { connect: { categoryId: data.categoryId } },
      },
    });
    await tx.inventory.create({
      data: {
        productId: product.productId,
        quantityAvailable: data.initialStock ?? 0,
      },
    });
    return product;
  });
}

export const findProductById = (productId: number) =>
  prisma.product.findUnique({ where: { productId } });

export async function updateProduct(data: ProductData) {
  return prisma.product.update({
    where: { productId: data.id! },
    data: {
      name: data.name,
      price: data.price,
    },
  });
}

export async function deleteProduct(productId: number) {
  return prisma.$transaction(async (tx) => {
    await tx.inventory.delete({ where: { productId } });
    return tx.product.delete({ where: { productId } });
  });
}

export async function findAllProducts() {
  return prisma.product.findMany();
}
