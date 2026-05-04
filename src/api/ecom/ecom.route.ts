import { productHandler } from "@/modules/ecom/product/product.controller";
import express, { type Router } from "express";

const ecomRouter: Router = express.Router();

ecomRouter.post("/product/create", productHandler);
ecomRouter.post("/product/update", productHandler);
ecomRouter.get("/product/:id", productHandler);
ecomRouter.get("/products", productHandler);
ecomRouter.delete("/product/:id", productHandler);

export default ecomRouter;
