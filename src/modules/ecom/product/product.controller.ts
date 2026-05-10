import type { Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  removeProduct,
  updateProduct,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  removeCategory,
  searchProducts,
  getProductsByCategory,
} from "./product.service";
import type { CategoryData, ProductData, ProductFilter } from "./product.types";
import { ForbiddenError, UnauthorizedError } from "@/modules/ecom/auth/errors";

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
      const productData = (req.body as ProductData) ?? {};
      if (!productData) {
        res.status(409).send("Invalid Data");
        return;
      }
      const product = await createProduct(productData, req.auth);
      res.status(201).send(product);
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(500).send({ error: error.message });
      }
    }
    return;
  }

  if (
    req.method === "GET" &&
    req.path.startsWith("/product/") &&
    req.params.id
  ) {
    const productId = Number(req.path.split("/")[2]);
    if (Number.isNaN(productId)) {
      res.status(400).send("Invalid Product ID ");
      return;
    }
    try {
      const product = await getProductById(productId);
      if (!product) {
        res.status(400).send("No product found");
        return;
      }
      res.status(200).json(product);
      return;
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  }

  if (req.path === "/products" && req.method === "GET") {
    try {
      const filter: Partial<ProductFilter> = {};
      if (req.query.search) filter.search = req.query.search as string;
      if (req.query.categoryId) filter.categoryId = Number(req.query.categoryId);
      if (req.query.page) filter.page = Number(req.query.page);
      if (req.query.limit) filter.limit = Number(req.query.limit);
      const allProducts = await getAllProducts(filter);
      if (!allProducts) {
        res.status(400).send("No products found");
        return;
      }
      res.status(200).send(allProducts);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }

  if (req.path === "/product/update" && req.method === "POST") {
    try {
      const productData = (req.body as ProductData) ?? {};
      if (!productData || !productData.id) {
        res.status(409).send("Invalid Data");
        return;
      }
      const updated = await updateProduct(productData, req.auth);
      res.status(200).send(updated);
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(500).send({ error: error.message });
      }
    }
    return;
  }

  if (
    req.method === "DELETE" &&
    req.path.startsWith("/product/") &&
    req.params.id
  ) {
    const productId = Number(req.params.id);
    try {
      const deletedProduct = await removeProduct(productId, req.auth);
      if (!deletedProduct) {
        res.status(400).send("No product found");
        return;
      }
      res.status(200).send("Product deleted successfully");
      return;
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(500).send({ error: error.message });
      }
    }
  }

  if (req.path === "/category" && req.method === "POST") {
    try {
      const categoryData = (req.body as CategoryData) ?? {};
      if (!categoryData || !categoryData.name) {
        res.status(409).send("Invalid Data");
        return;
      }
      const category = await createCategory(categoryData, req.auth);
      res.status(201).send(category);
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(500).send({ error: error.message });
      }
    }
    return;
  }

  if (req.path === "/categories" && req.method === "GET") {
    try {
      const categories = await getAllCategories();
      res.status(200).send(categories);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
    return;
  }

  if (req.path.startsWith("/category/") && req.params.id && req.method === "GET") {
    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      res.status(400).send("Invalid Category ID");
      return;
    }
    try {
      const category = await getCategoryById(categoryId);
      if (!category) {
        res.status(404).send("Category not found");
        return;
      }
      res.status(200).json(category);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
    return;
  }

  if (req.path === "/category/update" && req.method === "POST") {
    try {
      const categoryData = (req.body as CategoryData) ?? {};
      if (!categoryData || !categoryData.categoryId) {
        res.status(409).send("Invalid Data");
        return;
      }
      const updated = await updateCategory(categoryData, req.auth);
      res.status(200).send(updated);
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(500).send({ error: error.message });
      }
    }
    return;
  }

  if (req.path.startsWith("/category/") && req.params.id && req.method === "DELETE") {
    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      res.status(400).send("Invalid Category ID");
      return;
    }
    try {
      await removeCategory(categoryId, req.auth);
      res.status(200).send("Category deleted successfully");
    } catch (error: any) {
      if (!handleAuthError(res, error)) {
        res.status(500).send({ error: error.message });
      }
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}