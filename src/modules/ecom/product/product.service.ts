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

export async function getProductById(id: number, auth?: unknown) {
  if (auth) {
    assertAuth(auth);
    await findProductByIdRepo(id);
    authorize(auth, ProductPolicies.view());
  }
  return await findProductByIdRepo(id);
}

export async function getAllProducts(filter?: ProductFilter, auth?: unknown) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, ProductPolicies.view());
  }
  return await findAllProductsRepo(filter);
}

export async function createCategory(data: CategoryData, auth: unknown) {
  assertAuth(auth);
  authorize(auth, ProductPolicies.create());
  return await insertCategory(data);
}

export async function getCategoryById(id: number, auth?: unknown) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, ProductPolicies.view());
  }
  return await findCategoryById(id);
}

export async function getAllCategories(auth?: unknown) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, ProductPolicies.view());
  }
  return await findAllCategories();
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

export async function searchProducts(query: string, auth?: unknown) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, ProductPolicies.view());
  }
  return await searchProductsRepo(query);
}

export async function getProductsByCategory(categoryId: number, auth?: unknown) {
  if (auth) {
    assertAuth(auth);
    authorize(auth, ProductPolicies.view());
  }
  return await findProductsByCategory(categoryId);
}