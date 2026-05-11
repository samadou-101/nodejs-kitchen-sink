import type { Request, Response } from "express";
import { z } from "zod";
import * as productPublic from "../product/product.public.service";
import {
  checkout,
  trackOrders,
  getOrderForTracking,
} from "./customer.service";
import { validateCheckoutData, validatePhone, validateTrackingOrderId, validateSearchQuery } from "../validation/validators/customer.validator";
import { validateProductFilter, validateProductId } from "../validation/validators/product.validator";
import type { CheckoutData } from "./customer.types";
import type { ProductFilter } from "../product/product.types";

export async function customerHandler(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;

  if (path === "/products" && method === "GET") {
    try {
      const filter = validateProductFilter(req.query) as ProductFilter;
      const products = await productPublic.getAllProducts(filter);
      res.status(200).json(products);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (path === "/products/search" && method === "GET") {
    try {
      const query = validateSearchQuery(req.query.q);
      const products = await productPublic.searchProducts(query);
      res.status(200).json(products);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (
    method === "GET" &&
    path.startsWith("/product/") &&
    req.params.id
  ) {
    try {
      const productId = validateProductId(req.params.id);
      const product = await productPublic.getProductById(productId);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.status(200).json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (path === "/categories" && method === "GET") {
    try {
      const categories = await productPublic.getAllCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (path === "/checkout" && method === "POST") {
    try {
      const data = validateCheckoutData(req.body) as CheckoutData;
      const order = await checkout(data);
      res.status(201).json({ message: "Order placed successfully", orderId: order.orderId });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(400).json({ message: error.message });
    }
    return;
  }

  if (path === "/orders/track" && method === "GET") {
    try {
      const phone = validatePhone(req.query.phone);
      const orders = await trackOrders(phone);
      res.status(200).json(orders);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (
    method === "GET" &&
    path.startsWith("/orders/") &&
    req.params.id
  ) {
    try {
      const orderId = validateTrackingOrderId(req.params.id);
      const order = await getOrderForTracking(orderId);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}
