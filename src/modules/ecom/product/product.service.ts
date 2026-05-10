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

export async function createProduct(data: ProductData) {
  return await insertProduct(data);
}

export async function updateProduct(data: ProductData) {
  try {
    return await updateProductRepo(data);
  } catch (error) {
    throw new Error("Failed to update product", { cause: error });
  }
}

export async function removeProduct(id: number) {
  try {
    return await deleteProductRepo(id);
  } catch (error) {
    throw new Error("Failed to remove product", { cause: error });
  }
}

export async function getProductById(id: number) {
  try {
    return await findProductByIdRepo(id);
  } catch (error) {
    throw new Error("Failed to fetch product", { cause: error });
  }
}

export async function getAllProducts(filter?: ProductFilter) {
  return await findAllProductsRepo(filter);
}

export async function createCategory(data: CategoryData) {
  return await insertCategory(data);
}

export async function getCategoryById(id: number) {
  return await findCategoryById(id);
}

export async function getAllCategories() {
  return await findAllCategories();
}

export async function updateCategory(data: CategoryData) {
  return await updateCategoryRepo(data);
}

export async function removeCategory(id: number) {
  return await deleteCategory(id);
}

export async function searchProducts(query: string) {
  return await searchProductsRepo(query);
}

export async function getProductsByCategory(categoryId: number) {
  return await findProductsByCategory(categoryId);
}
