import { prisma } from "@/config/db.config";
import {
  deleteProduct as deleteProductRepo,
  findProductById as findProductByIdRepo,
  insertProduct,
  updateProduct as updateProductRepo,
  findAllProducts as findAllProductsRepo,
  findCategoryById,
  findAllCategories,
  insertCategory,
  updateCategory as updateCategoryRepo,
  deleteCategory,
  searchProducts as searchProductsRepo,
  findProductsByCategory,
} from "./product.repo";
import type { CategoryData, ProductData, ProductFilter } from "./product.types";
import {
  enforceCreateProduct,
  enforceUpdateProduct,
  enforceDeleteProduct,
} from "@/modules/ecom/auth";
import { assertAuth, checkAuthz } from "@/modules/ecom/auth/errors";

export async function createProduct(data: ProductData, auth: unknown) {
  assertAuth(auth);
  const result = enforceCreateProduct(auth as any);
  checkAuthz(result);
  return await insertProduct(data);
}

export async function updateProduct(data: ProductData, auth: unknown) {
  assertAuth(auth);
  if (!data.id) throw new Error("Product ID required");
  const productId = data.id;

  return await prisma.$transaction(async (tx) => {
    const result = await enforceUpdateProduct(auth as any, tx, productId);
    checkAuthz(result);
    try {
      return await updateProductRepo(data);
    } catch (error) {
      throw new Error("Failed to update product", { cause: error });
    }
  });
}

export async function removeProduct(id: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const result = await enforceDeleteProduct(auth as any, tx, id);
    checkAuthz(result);
    try {
      return await deleteProductRepo(id);
    } catch (error) {
      throw new Error("Failed to remove product", { cause: error });
    }
  });
}

export async function getProductById(id: number) {
  return await findProductByIdRepo(id);
}

export async function getAllProducts(filter?: ProductFilter) {
  return await findAllProductsRepo(filter);
}

export async function createCategory(data: CategoryData, auth: unknown) {
  assertAuth(auth);
  const result = enforceCreateProduct(auth as any);
  checkAuthz(result);
  return await insertCategory(data);
}

export async function getCategoryById(id: number) {
  return await findCategoryById(id);
}

export async function getAllCategories() {
  return await findAllCategories();
}

export async function updateCategory(data: CategoryData, auth: unknown) {
  assertAuth(auth);
  if (!data.categoryId) throw new Error("Category ID required");
  const categoryId = data.categoryId;

  return await prisma.$transaction(async (tx) => {
    const result = await enforceUpdateProduct(auth as any, tx, categoryId);
    checkAuthz(result);
    return await updateCategoryRepo(data);
  });
}

export async function removeCategory(id: number, auth: unknown) {
  assertAuth(auth);

  return await prisma.$transaction(async (tx) => {
    const result = await enforceDeleteProduct(auth as any, tx, id);
    checkAuthz(result);
    return await deleteCategory(id);
  });
}

export async function searchProducts(query: string) {
  return await searchProductsRepo(query);
}

export async function getProductsByCategory(categoryId: number) {
  return await findProductsByCategory(categoryId);
}