import type { Request, Response, NextFunction } from "express";
import * as productPublic from "../product/product.public.service";
import {
  checkout,
  trackOrders,
  getOrderForTracking,
} from "./customer.service";
import {
  validateCheckoutData,
  validatePhone,
  validateTrackingOrderId,
  validateSearchQuery,
} from "../validation/validators/customer.validator";
import {
  validateProductFilter,
  validateProductId,
} from "../validation/validators/product.validator";
import type { CheckoutData } from "./customer.types";
import type { ProductFilter } from "../product/product.types";
import {
  sendSuccess,
  sendCreated,
  sendError,
} from "@/modules/ecom/shared/response";

export async function customerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = req.path;
  const method = req.method;

  if (path === "/products" && method === "GET") {
    try {
      const filter = validateProductFilter(req.query) as ProductFilter;
      const products = await productPublic.getAllProducts(filter);
      sendSuccess(res, products);
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  if (path === "/products/search" && method === "GET") {
    try {
      const query = validateSearchQuery(req.query.q);
      const products = await productPublic.searchProducts(query);
      sendSuccess(res, products);
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  if (method === "GET" && path.startsWith("/product/") && req.params.id) {
    try {
      const productId = validateProductId(req.params.id);
      const product = await productPublic.getProductById(productId);
      if (!product) {
        sendError(res, 404, "NOT_FOUND", "Product not found");
        return;
      }
      sendSuccess(res, product);
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  if (path === "/categories" && method === "GET") {
    try {
      const categories = await productPublic.getAllCategories();
      sendSuccess(res, categories);
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  if (path === "/checkout" && method === "POST") {
    try {
      const data = validateCheckoutData(req.body) as CheckoutData;
      const order = await checkout(data);
      sendCreated(res, {
        message: "Order placed successfully",
        orderId: order.orderId,
      });
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  if (path === "/orders/track" && method === "GET") {
    try {
      const phone = validatePhone(req.query.phone);
      const orders = await trackOrders(phone);
      sendSuccess(res, orders);
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  if (method === "GET" && path.startsWith("/orders/") && req.params.id) {
    try {
      const orderId = validateTrackingOrderId(req.params.id);
      const order = await getOrderForTracking(orderId);
      if (!order) {
        sendError(res, 404, "NOT_FOUND", "Order not found");
        return;
      }
      sendSuccess(res, order);
    } catch (error: any) {
      next(error);
      return;
    }
    return;
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
}
