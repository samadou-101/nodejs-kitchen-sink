import type { Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  removeProduct,
} from "./product.service";
import type { ProductData } from "./product.types";

export async function productHandler(req: Request, res: Response) {
  console.log(req.path);

  // Creating product
  if (req.path === "/product/create" && req.method === "POST") {
    try {
      const productData = (req.body as ProductData) ?? {};
      if (!productData) {
        res.status(409).send("Invalid Data");
        return;
      }
      const product = await createProduct(productData);
      res.status(201).send(product);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
      return;
    }
  }

  // Getting product by id
  if (
    req.method === "GET" &&
    req.path.startsWith("/product/") &&
    req.params.id
  ) {
    const productId = Number(req.path.split("/")[2]);
    console.log("hit get product");
    if (Number.isNaN(productId)) {
      res.status(400).send("Invalid Product ID ");
      return;
    }
    try {
      const product = await getProductById(productId);
      if (!product) {
        res.status(400).send("No prdouct found");
        return;
      }
      res.status(200).json(product);
      return;
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  }

  // getting all products
  if (req.path === "/products" && req.method === "GET") {
    try {
      const allProducts = await getAllProducts();
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

  // deleting a product
  if (
    req.method === "DELETE" &&
    req.path.startsWith("/product/") &&
    req.params.id
  ) {
    console.log("delete route hit ");
    const productId = Number(req.params.id);
    try {
      const deletedProduct = await removeProduct(productId);
      if (!deletedProduct) {
        res.status(400).send("No product found");
        return;
      }
      res.status(200).send("Product deleted successffully");
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
}
