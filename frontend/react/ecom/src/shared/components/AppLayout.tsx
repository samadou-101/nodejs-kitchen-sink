import { useState, type ReactNode } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "#shared/api/auth-provider";
import { useCart } from "../../features/shopping-cart/hooks/use-cart";
import { Sheet, SheetContent, SheetTrigger } from "#components/components/ui/sheet";

const navLinkDefs = [
  { to: "/", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/track", label: "Track Order" },
];

function NavItems({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isAdmin, isEmployee, isLoading } = useAuth();
  const { totalItems } = useCart();

  return (
    <>
      {navLinkDefs.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="relative flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
          {link.to === "/cart" && totalItems > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Link>
      ))}
      {children}
      {isLoading ? null : isAuthenticated ? (
        <>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
          {isEmployee && (
            <Link
              to="/employee"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              My Orders
            </Link>
          )}
        </>
      ) : (
        <>
          <Link
            to="/admin/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin Login
          </Link>
          <Link
            to="/employee/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Employee Login
          </Link>
        </>
      )}
    </>
  );
}

export function AppLayout() {
  const { totalItems } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-bold tracking-tight">
              E-Com Store
            </Link>
            <div className="hidden items-center gap-4 md:flex">
              <NavItems />
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="mt-8 flex flex-col gap-4">
                  <NavItems>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="self-end text-sm text-muted-foreground"
                    >
                      Close
                    </button>
                  </NavItems>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4">
        <Outlet />
      </main>
    </div>
  );
}
