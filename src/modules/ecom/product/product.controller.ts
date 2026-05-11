import type { Request, Response, NextFunction } from "express";
import {
  createProduct,
  removeProduct,
  updateProduct,
  createCategory,
  updateCategory,
  removeCategory,
} from "./product.admin.service";
import type { CategoryData, ProductData } from "./product.types";
import {
  validateProductData,
  validateCategoryData,
  validateProductId,
  validateCategoryId,
} from "../validation";
import { sendCreated, sendSuccess, sendError } from "@/modules/ecom/shared/response";

export async function productHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.path === "/product/create" && req.method === "POST") {
    try {
      const productData = validateProductData(req.body) as ProductData;
      const product = await createProduct(productData, req.auth);
      sendCreated(res, product);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  if (req.path === "/product/update" && req.method === "POST") {
    try {
      const productData = validateProductData(req.body) as ProductData;
      const updated = await updateProduct(productData, req.auth);
      sendSuccess(res, updated);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  if (
    req.method === "DELETE" &&
    req.path.startsWith("/product/") &&
    req.params.id
  ) {
    try {
      const productId = validateProductId(req.params.id);
      const deletedProduct = await removeProduct(productId, req.auth);
      if (!deletedProduct) {
        sendError(res, 404, "NOT_FOUND", "No product found");
        return;
      }
      sendSuccess(res, { message: "Product deleted successfully" });
      return;
    } catch (error: unknown) {
      next(error);
      return;
    }
  }

  if (req.path === "/category" && req.method === "POST") {
    try {
      const categoryData = validateCategoryData(req.body) as CategoryData;
      const category = await createCategory(categoryData, req.auth);
      sendCreated(res, category);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  if (req.path === "/category/update" && req.method === "POST") {
    try {
      const categoryData = validateCategoryData(req.body) as CategoryData;
      const updated = await updateCategory(categoryData, req.auth);
      sendSuccess(res, updated);
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  if (
    req.path.startsWith("/category/") &&
    req.params.id &&
    req.method === "DELETE"
  ) {
    try {
      const categoryId = validateCategoryId(req.params.id);
      await removeCategory(categoryId, req.auth);
      sendSuccess(res, { message: "Category deleted successfully" });
    } catch (error: unknown) {
      next(error);
      return;
    }
    return;
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
}
