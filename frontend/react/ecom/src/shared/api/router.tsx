import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "#shared/api/auth-provider";
import { ProductCatalogPage } from "#features/product-catalog/components/ProductCatalogPage";
import { ProductDetail } from "#features/product-catalog/components/ProductDetail";
import { CartPage } from "#features/shopping-cart/components/CartPage";
import { CheckoutPage } from "#features/order-checkout/components/CheckoutPage";
import { TrackOrderPage } from "#features/order-tracking/components/TrackOrderPage";
import { OrderDetail } from "#features/order-tracking/components/OrderDetail";
import { AdminLayout } from "#features/admin-dashboard/components/AdminLayout";
import { AuthGuard } from "#shared/components/AuthGuard";
import { AssignedOrdersList } from "#features/employee-orders/components/AssignedOrdersList";
import { ProductManagement } from "#features/admin-dashboard/components/ProductManagement";
import { CategoryManagement } from "#features/admin-dashboard/components/CategoryManagement";
import { OrderManagement } from "#features/admin-dashboard/components/OrderManagement";
import { EmployeeManagement } from "#features/admin-dashboard/components/EmployeeManagement";
import { InventoryManagement } from "#features/admin-dashboard/components/InventoryManagement";
import { PayrollManagement } from "#features/admin-dashboard/components/PayrollManagement";
import { AppLayout } from "#shared/components/AppLayout";
import { LoginPage } from "#shared/components/LoginPage";

export const router = createBrowserRouter([
  {
    element: <AuthProvider><AppLayout /></AuthProvider>,
    children: [
      { path: "/", element: <ProductCatalogPage /> },
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
          { index: true, element: <ProductManagement /> },
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
