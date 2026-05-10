import { adminAuthController } from "@/modules/ecom/admin/controllers/auth.controller";
import { employeeAuthController } from "@/modules/ecom/employee/controllers/auth.controller";
import { employeeAdminHandler } from "@/modules/ecom/admin/controllers/employee.controller";
import { inventoryAdminHandler } from "@/modules/ecom/admin/controllers/inventory.controller";
import { employeeOrderHandler } from "@/modules/ecom/employee/controllers/order.controller";
import { orderHandler } from "@/modules/ecom/order/order.controller";
import { productHandler } from "@/modules/ecom/product/product.controller";
import { customerHandler } from "@/modules/ecom/customer/customer.controller";
import { authenticate, requireRole } from "@/modules/ecom/auth";
import express, { type Router, type RequestHandler } from "express";

const ecomRouter: Router = express.Router();

const adminAuth: RequestHandler[] = [authenticate, requireRole("ADMIN")];
const employeeAuth: RequestHandler[] = [authenticate, requireRole("EMPLOYEE")];

ecomRouter.post("/product/create", ...adminAuth, productHandler);
ecomRouter.post("/product/update", ...adminAuth, productHandler);
ecomRouter.delete("/product/:id", ...adminAuth, productHandler);

ecomRouter.get("/products", productHandler);
ecomRouter.get("/product/:id", productHandler);
ecomRouter.get("/categories", productHandler);
ecomRouter.get("/category/:id", productHandler);

ecomRouter.post("/order/create", ...adminAuth, orderHandler);
ecomRouter.get("/orders", ...adminAuth, orderHandler);
ecomRouter.get("/order/:id", ...adminAuth, orderHandler);
ecomRouter.delete("/order/:id", ...adminAuth, orderHandler);
ecomRouter.patch("/order/:id", ...adminAuth, orderHandler);
ecomRouter.patch("/order/:id/status", ...adminAuth, orderHandler);
ecomRouter.patch("/order/:id/employee", ...adminAuth, orderHandler);
ecomRouter.patch("/order/:id/employee/remove", ...adminAuth, orderHandler);

ecomRouter.post("/category", ...adminAuth, productHandler);
ecomRouter.post("/category/update", ...adminAuth, productHandler);
ecomRouter.delete("/category/:id", ...adminAuth, productHandler);

ecomRouter.post("/admin/signup", adminAuthController);
ecomRouter.post("/admin/login", adminAuthController);
ecomRouter.post("/admin/employee/add", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/employees/:id/payment-type", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/employees/:id/payments", ...adminAuth, employeeAdminHandler);
ecomRouter.get("/admin/employees/:id/performance", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/payroll/preview", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/payroll", ...adminAuth, employeeAdminHandler);
ecomRouter.get("/admin/payroll", ...adminAuth, employeeAdminHandler);
ecomRouter.get("/admin/payroll/:id", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/payroll/:id/confirm", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/payroll/:id/paid", ...adminAuth, employeeAdminHandler);
ecomRouter.post("/admin/inventory/adjust", ...adminAuth, inventoryAdminHandler);
ecomRouter.get("/admin/inventory/low-stock", ...adminAuth, inventoryAdminHandler);

ecomRouter.post("/employee/signup", employeeAuthController);
ecomRouter.post("/employee/login", employeeAuthController);
ecomRouter.get("/employee/orders", ...employeeAuth, employeeOrderHandler);
ecomRouter.patch("/employee/orders/:id/confirm", ...employeeAuth, employeeOrderHandler);
ecomRouter.patch("/employee/orders/:id/reject", ...employeeAuth, employeeOrderHandler);
ecomRouter.post("/employee/orders/:id/notes", ...employeeAuth, employeeOrderHandler);

ecomRouter.get("/products/search", customerHandler);
ecomRouter.get("/cart", customerHandler);
ecomRouter.post("/cart/add", customerHandler);
ecomRouter.patch("/cart/:itemId", customerHandler);
ecomRouter.delete("/cart/:itemId", customerHandler);
ecomRouter.delete("/cart", customerHandler);
ecomRouter.post("/checkout", customerHandler);
ecomRouter.get("/orders/track", customerHandler);
ecomRouter.get("/orders/:id", customerHandler);

export default ecomRouter;
