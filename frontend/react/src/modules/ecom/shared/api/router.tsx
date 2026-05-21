import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "#ecom/shared/api/auth-provider";
import { ProductCatalogPage } from "#ecom/features/product-catalog/components/ProductCatalogPage";
import { ProductDetail } from "#ecom/features/product-catalog/components/ProductDetail";
import { CartPage } from "#ecom/features/shopping-cart/components/CartPage";
import { CheckoutPage } from "#ecom/features/order-checkout/components/CheckoutPage";
import { TrackOrderPage } from "#ecom/features/order-tracking/components/TrackOrderPage";
import { OrderDetail } from "#ecom/features/order-tracking/components/OrderDetail";
import { AdminLayout } from "#ecom/features/admin-dashboard/components/AdminLayout";
import { AuthGuard } from "#ecom/shared/components/AuthGuard";
import { AssignedOrdersList } from "#ecom/features/employee-orders/components/AssignedOrdersList";
import { AdminDashboardOverview } from "#ecom/features/admin-dashboard/components/AdminDashboardOverview";
import { ProductManagement } from "#ecom/features/admin-dashboard/components/ProductManagement";
import { CategoryManagement } from "#ecom/features/admin-dashboard/components/CategoryManagement";
import { OrderManagement } from "#ecom/features/admin-dashboard/components/OrderManagement";
import { EmployeeManagement } from "#ecom/features/admin-dashboard/components/EmployeeManagement";
import { InventoryManagement } from "#ecom/features/admin-dashboard/components/InventoryManagement";
import { PayrollManagement } from "#ecom/features/admin-dashboard/components/PayrollManagement";
import { AppLayout } from "#ecom/shared/components/AppLayout";
import { LoginPage } from "#ecom/shared/components/LoginPage";

const AboutPage = lazy(() =>
  import("#ecom/shared/components/AboutPage").then((m) => ({
    default: m.AboutPage,
  })),
);

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    ),
    children: [
      { path: "/", element: <ProductCatalogPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/product/:id", element: <ProductDetail /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/track", element: <TrackOrderPage /> },
      { path: "/track/:id", element: <OrderDetail /> },
      { path: "/admin/login", element: <LoginPage type="admin" login /> },
      { path: "/admin/signup", element: <LoginPage type="admin" /> },
      { path: "/employee/login", element: <LoginPage type="employee" login /> },
      { path: "/employee/signup", element: <LoginPage type="employee" /> },
      {
        path: "/admin",
        element: (
          <AuthGuard role="admin">
            <AdminLayout />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <AdminDashboardOverview /> },
          { path: "products", element: <ProductManagement /> },
          { path: "categories", element: <CategoryManagement /> },
          { path: "orders", element: <OrderManagement /> },
          { path: "employees", element: <EmployeeManagement /> },
          { path: "inventory", element: <InventoryManagement /> },
          { path: "payroll", element: <PayrollManagement /> },
        ],
      },
      {
        path: "/employee",
        element: (
          <AuthGuard role="employee">
            <AssignedOrdersList />
          </AuthGuard>
        ),
      },
    ],
  },
]);
