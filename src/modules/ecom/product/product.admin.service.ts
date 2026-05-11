import { prisma } from "@/config/db.config";
import {
  deleteProduct as deleteProductRepo,
  findProductById as findProductByIdRepo,
  insertProduct,
  updateProduct as updateProductRepo,
  insertCategory,
  updateCategory as updateCategoryRepo,
  deleteCategory,
} from "./product.repo";
import type { CategoryData, ProductData } from "./product.types";
import { authorize } from "@/modules/ecom/auth";
import { ProductPolicies } from "@/modules/ecom/auth/policies";
import { assertAuth } from "@/modules/ecom/auth/errors";

export async function createProduct(data: ProductData, auth: unknown) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.create());
  return await insertProduct(data);
}

export async function updateProduct(data: ProductData, auth: unknown) {
  assertAuth(auth);
  if (!data.id) throw new Error("Product ID required");

  await findProductByIdRepo(data.id);
  authorize(auth, ProductPolicies.update());

  return await prisma.$transaction(async (tx) => {
    try {
      return await updateProductRepo(data);
    } catch (error) {
      throw new Error("Failed to update product", { cause: error });
    }
  });
}

export async function removeProduct(id: number, auth: unknown) {
  assertAuth(auth);

  await findProductByIdRepo(id);
  authorize(auth, ProductPolicies.delete());

  return await prisma.$transaction(async (tx) => {
    try {
      return await deleteProductRepo(id);
    } catch (error) {
      throw new Error("Failed to remove product", { cause: error });
    }
  });
}

export async function createCategory(data: CategoryData, auth: unknown) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.create());
  return await insertCategory(data);
}

export async function updateCategory(data: CategoryData, auth: unknown) {
  assertAuth(auth);
  if (!data.categoryId) throw new Error("Category ID required");

  authorize(auth, ProductPolicies.update());

  return await prisma.$transaction(async (tx) => {
    return await updateCategoryRepo(data);
  });
}

export async function removeCategory(id: number, auth: unknown) {
  assertAuth(auth);

  authorize(auth, ProductPolicies.delete());

  return await prisma.$transaction(async (tx) => {
    return await deleteCategory(id);
  });
}