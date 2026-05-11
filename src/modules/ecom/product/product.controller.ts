import type { Request, Response } from "express";
import {
  createProduct,
  removeProduct,
  updateProduct,
  createCategory,
  updateCategory,
  removeCategory,
} from "./product.admin.service";
import type { CategoryData, ProductData } from "./product.types";
import { ForbiddenError, UnauthorizedError } from "@/modules/ecom/auth/errors";
import {
  validateProductData,
  validateCategoryData,
  validateProductId,
  validateCategoryId,
} from "../validation";
import { handleValidationError } from "../validation";

function handleAuthError(res: Response, error: unknown) {
  if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: error.message });
    return true;
  }
  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return true;
  }
  return false;
}

export async function productHandler(req: Request, res: Response) {
  if (req.path === "/product/create" && req.method === "POST") {
    try {
      const productData = validateProductData(req.body) as ProductData;
      const product = await createProduct(productData, req.auth);
      res.status(201).send(product);
    } catch (error: unknown) {
      if (!handleValidationError(res, error) && !handleAuthError(res, error)) {
        res.status(500).send({ error: (error as Error).message });
      }
    }
    return;
  }

  if (req.path === "/product/update" && req.method === "POST") {
    try {
      const productData = validateProductData(req.body) as ProductData;
      const updated = await updateProduct(productData, req.auth);
      res.status(200).send(updated);
    } catch (error: unknown) {
      if (!handleValidationError(res, error) && !handleAuthError(res, error)) {
        res.status(500).send({ error: (error as Error).message });
      }
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
        res.status(400).send("No product found");
        return;
      }
      res.status(200).send("Product deleted successfully");
      return;
    } catch (error: unknown) {
      if (!handleValidationError(res, error) && !handleAuthError(res, error)) {
        res.status(500).send({ error: (error as Error).message });
      }
    }
  }

  if (req.path === "/category" && req.method === "POST") {
    try {
      const categoryData = validateCategoryData(req.body) as CategoryData;
      const category = await createCategory(categoryData, req.auth);
      res.status(201).send(category);
    } catch (error: unknown) {
      if (!handleValidationError(res, error) && !handleAuthError(res, error)) {
        res.status(500).send({ error: (error as Error).message });
      }
    }
    return;
  }

  if (req.path === "/category/update" && req.method === "POST") {
    try {
      const categoryData = validateCategoryData(req.body) as CategoryData;
      const updated = await updateCategory(categoryData, req.auth);
      res.status(200).send(updated);
    } catch (error: unknown) {
      if (!handleValidationError(res, error) && !handleAuthError(res, error)) {
        res.status(500).send({ error: (error as Error).message });
      }
    }
    return;
  }

  if (req.path.startsWith("/category/") && req.params.id && req.method === "DELETE") {
    try {
      const categoryId = validateCategoryId(req.params.id);
      await removeCategory(categoryId, req.auth);
      res.status(200).send("Category deleted successfully");
    } catch (error: unknown) {
      if (!handleValidationError(res, error) && !handleAuthError(res, error)) {
        res.status(500).send({ error: (error as Error).message });
      }
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}