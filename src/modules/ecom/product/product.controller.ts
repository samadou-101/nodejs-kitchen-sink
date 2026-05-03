import type { Request, Response } from "express";
import { createProduct } from "./product.service";
import type { ProductData } from "./product.types";

export async function productHandler(req: Request, res: Response) {
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

  if (req.path === "/product/:id" && req.method === "POST") {
  }

  if (req.path === "/product" && req.method === "GET") {
  }

  if (req.path === "/product/:id" && req.method === "DELETE") {
  }
}
