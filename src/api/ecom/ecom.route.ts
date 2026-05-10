import { adminAuthController } from "@/modules/ecom/admin/controllers/auth.controller";
import { employeeAuthController } from "@/modules/ecom/employee/controllers/auth.controller";
import { employeeAdminHandler } from "@/modules/ecom/admin/controllers/employee.controller";
import { inventoryAdminHandler } from "@/modules/ecom/admin/controllers/inventory.controller";
import { employeeOrderHandler } from "@/modules/ecom/employee/controllers/order.controller";
import { orderHandler } from "@/modules/ecom/order/order.controller";
import { productHandler } from "@/modules/ecom/product/product.controller";
import { customerHandler } from "@/modules/ecom/customer/customer.controller";
import express, { type Router } from "express";

const ecomRouter: Router = express.Router();

// product routes
ecomRouter.post("/product/create", productHandler);
ecomRouter.post("/product/update", productHandler);
ecomRouter.get("/product/:id", productHandler);
ecomRouter.get("/products", productHandler);
ecomRouter.delete("/product/:id", productHandler);

// category routes
ecomRouter.post("/category", productHandler);
ecomRouter.post("/category/update", productHandler);
ecomRouter.get("/categories", productHandler);
ecomRouter.get("/category/:id", productHandler);
ecomRouter.delete("/category/:id", productHandler);

// order routes
ecomRouter.post("/order/create", orderHandler);
ecomRouter.get("/orders", orderHandler);
ecomRouter.get("/order/:id", orderHandler);
ecomRouter.delete("/order/:id", orderHandler);
ecomRouter.patch("/order/:id", orderHandler);
ecomRouter.patch("/order/:id/status", orderHandler);
ecomRouter.patch("/order/:id/employee", orderHandler);
ecomRouter.patch("/order/:id/employee/remove", orderHandler);

// Admin Auth
ecomRouter.post("/admin/signup", adminAuthController);
ecomRouter.post("/admin/login", adminAuthController);

// Employee Auth
ecomRouter.post("/employee/signup", employeeAuthController);
ecomRouter.post("/employee/login", employeeAuthController);

// Employee Orders
ecomRouter.get("/employee/orders", employeeOrderHandler);
ecomRouter.patch("/employee/orders/:id/confirm", employeeOrderHandler);
ecomRouter.patch("/employee/orders/:id/reject", employeeOrderHandler);
ecomRouter.post("/employee/orders/:id/notes", employeeOrderHandler);

// Admin Employee
ecomRouter.post("/admin/employee/add", employeeAdminHandler);
ecomRouter.post("/admin/employees/:id/payment-type", employeeAdminHandler);
ecomRouter.post("/admin/employees/:id/payments", employeeAdminHandler);
ecomRouter.get("/admin/employees/:id/performance", employeeAdminHandler);

// Admin Payroll
ecomRouter.post("/admin/payroll/preview", employeeAdminHandler);
ecomRouter.post("/admin/payroll", employeeAdminHandler);
ecomRouter.get("/admin/payroll", employeeAdminHandler);
ecomRouter.get("/admin/payroll/:id", employeeAdminHandler);
ecomRouter.post("/admin/payroll/:id/confirm", employeeAdminHandler);
ecomRouter.post("/admin/payroll/:id/paid", employeeAdminHandler);

// Admin Inventory
ecomRouter.post("/admin/inventory/adjust", inventoryAdminHandler);
ecomRouter.get("/admin/inventory/low-stock", inventoryAdminHandler);

// Customer routes (no auth)
ecomRouter.get("/products", customerHandler);
ecomRouter.get("/products/search", customerHandler);
ecomRouter.get("/product/:id", customerHandler);
ecomRouter.get("/categories", customerHandler);
ecomRouter.get("/cart", customerHandler);
ecomRouter.post("/cart/add", customerHandler);
ecomRouter.patch("/cart/:itemId", customerHandler);
ecomRouter.delete("/cart/:itemId", customerHandler);
ecomRouter.delete("/cart", customerHandler);
ecomRouter.post("/checkout", customerHandler);
ecomRouter.get("/orders/track", customerHandler);
ecomRouter.get("/orders/:id", customerHandler);

export default ecomRouter;
