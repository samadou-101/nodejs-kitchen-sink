import type { Request, Response } from "express";
import {
  browseProducts,
  filterByCategory,
  searchProducts,
  getProductById,
  getCategories,
  checkout,
  trackOrders,
  getOrderForTracking,
} from "./customer.service";
import type { CheckoutData } from "./customer.types";

export async function customerHandler(req: Request, res: Response) {
  const path = req.path;
  const method = req.method;

  if (path === "/products" && method === "GET") {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      if (req.query.categoryId) {
        const products = await filterByCategory(Number(req.query.categoryId));
        res.status(200).json(products);
        return;
      }
      const products = await browseProducts(page, limit);
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (path === "/products/search" && method === "GET") {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ message: "q (search query) is required" });
        return;
      }
      const products = await searchProducts(query);
      res.status(200).json(products);
    } catch (error: any) {
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
      const productId = Number(req.params.id);
      const product = await getProductById(productId);
      if (!product || product.length === 0) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.status(200).json(product[0]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (path === "/categories" && method === "GET") {
    try {
      const categories = await getCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (path === "/checkout" && method === "POST") {
    try {
      const data = req.body as CheckoutData;
      if (!data.name || !data.phone || !data.address || !data.city || !data.items?.length) {
        res.status(400).json({ message: "Missing required fields: name, phone, address, city, items" });
        return;
      }
      const order = await checkout(data);
      res.status(201).json({ message: "Order placed successfully", orderId: order.orderId });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
    return;
  }

  if (path === "/orders/track" && method === "GET") {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        res.status(400).json({ message: "phone is required" });
        return;
      }
      const orders = await trackOrders(phone);
      res.status(200).json(orders);
    } catch (error: any) {
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
      const orderId = Number(req.params.id);
      const order = await getOrderForTracking(orderId);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(404).json({ message: "Route not found" });
}
