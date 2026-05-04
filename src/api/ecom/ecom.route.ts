import { orderHandler } from "@/modules/ecom/order/order.controller";
import { productHandler } from "@/modules/ecom/product/product.controller";
import express, { type Router } from "express";

const ecomRouter: Router = express.Router();

// product routes
ecomRouter.post("/product/create", productHandler);
ecomRouter.post("/product/update", productHandler);
ecomRouter.get("/product/:id", productHandler);
ecomRouter.get("/products", productHandler);
ecomRouter.delete("/product/:id", productHandler);

// order routes
ecomRouter.post("/order/create", orderHandler);
ecomRouter.get("/order/:id", orderHandler);
ecomRouter.delete("/order/:id", orderHandler);
ecomRouter.patch("/order/:id", orderHandler);
ecomRouter.patch("/order/:id/status", orderHandler);
ecomRouter.patch("/order/:id/employee", orderHandler);
ecomRouter.patch("/order/:id/employee/remove", orderHandler);

export default ecomRouter;
