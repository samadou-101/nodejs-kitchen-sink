import {
  deleteProduct as deleteProductRepo,
  findProductById as findProductByIdRepo,
  insertProduct,
  updateProduct as updateProductRepo,
} from "./product.repo";
import type { ProductData } from "./product.types";

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
