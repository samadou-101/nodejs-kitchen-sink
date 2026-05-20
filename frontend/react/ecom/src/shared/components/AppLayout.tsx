import { Outlet, Link } from "react-router-dom";
import { useAuth } from "#shared/api/auth-provider";
import { useCart } from "../../features/shopping-cart/hooks/use-cart";

export function AppLayout() {
  const { isAuthenticated, isAdmin, isEmployee, isLoading } = useAuth();
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-bold">
              E-Com Store
            </Link>
            <div className="flex gap-4 text-sm">
              <Link to="/" className="hover:underline">
                Products
              </Link>
              <Link to="/cart" className="hover:underline relative">
                Cart
                {totalItems > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to="/track" className="hover:underline">
                Track Order
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {isLoading ? null : isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="hover:underline">
                    Dashboard
                  </Link>
                )}
                {isEmployee && (
                  <Link to="/employee" className="hover:underline">
                    My Orders
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/admin/login" className="hover:underline">
                  Admin Login
                </Link>
                <Link to="/employee/login" className="hover:underline">
                  Employee Login
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4">
        <Outlet />
      </main>
    </div>
  );
}
