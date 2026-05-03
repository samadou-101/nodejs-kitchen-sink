import { prisma } from "@/config/db.config";
import type { ProductData } from "./product.types";

export async function insertProduct(data: ProductData) {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description || null,
      category: { connect: { categoryId: data.categoryId } },
    },
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

export const deleteProduct = (productId: number) =>
  prisma.product.delete({ where: { productId } });
