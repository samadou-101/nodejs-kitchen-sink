import { prisma } from "@/config/db.config";
import type { CategoryData, ProductData, ProductFilter } from "./product.types";

export async function insertCategory(data: CategoryData) {
  return prisma.productCategory.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

export async function findCategoryById(categoryId: number) {
  return prisma.productCategory.findUnique({
    where: { categoryId },
    include: { products: true },
  });
}

export async function findAllCategories() {
  return prisma.productCategory.findMany({
    include: { _count: { select: { products: true } } },
  });
}

export async function updateCategory(data: CategoryData) {
  return prisma.productCategory.update({
    where: { categoryId: data.categoryId! },
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

export async function deleteCategory(categoryId: number) {
  return prisma.productCategory.delete({
    where: { categoryId },
  });
}

export async function insertProduct(data: ProductData) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
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
  prisma.product.findUnique({
    where: { productId },
    include: { inventory: true },
  });

export async function updateProduct(data: ProductData) {
  return prisma.product.update({
    where: { productId: data.id! },
    data: {
      name: data.name,
      price: data.price,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      categoryId: data.categoryId,
    },
  });
}

export async function deleteProduct(productId: number) {
  return prisma.$transaction(async (tx) => {
    await tx.inventory.delete({ where: { productId } });
    return tx.product.delete({ where: { productId } });
  });
}

export async function findAllProducts(filter: ProductFilter = {}) {
  const { search, categoryId, page = 1, limit = 20 } = filter;
  const skip = (page - 1) * limit;

  return prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      inventory: true,
      category: true,
    },
    skip,
    take: limit,
  });
}

export async function findProductsByCategory(categoryId: number) {
  return prisma.product.findMany({
    where: { categoryId },
    include: { inventory: true },
  });
}

export async function searchProducts(query: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { inventory: true },
  });
}
