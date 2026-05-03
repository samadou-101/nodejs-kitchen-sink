import { productHandler } from "@/modules/ecom/product/product.controller";
import express, { type Router } from "express";

const ecomRouter: Router = express.Router();

ecomRouter.post("/product/create", productHandler);
ecomRouter.post("/product/update", productHandler);
ecomRouter.post("/product/remove", productHandler);
ecomRouter.get("/product/:id", productHandler);

export default ecomRouter;
