import {
  findProductById as findProductByIdRepo,
  findAllProducts as findAllProductsRepo,
  findCategoryById,
  findAllCategories,
  searchProducts as searchProductsRepo,
  findProductsByCategory,
} from "./product.repo";
import type { ProductFilter } from "./product.types";

export async function getProductById(productId: number) {
  return await findProductByIdRepo(productId);
}

export async function getAllProducts(filter?: ProductFilter) {
  return await findAllProductsRepo(filter);
}

export async function getCategoryById(categoryId: number) {
  return await findCategoryById(categoryId);
}

export async function getAllCategories() {
  return await findAllCategories();
}

export async function searchProducts(query: string) {
  return await searchProductsRepo(query);
}

export async function getProductsByCategory(categoryId: number) {
  return await findProductsByCategory(categoryId);
}