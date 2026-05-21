import { useState, type ReactNode } from "react";
import { Outlet, Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag03Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "#shared/api/auth-provider";
import { useCart } from "#features/shopping-cart/hooks/use-cart";
import { cn } from "#components/lib/utils";
import { buttonVariants } from "#components/lib/button-variants";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "#components/components/ui/sheet";

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
          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 relative flex items-center gap-2 text-sm font-medium transition-colors rounded-sm"
        >
          {link.label}
          {link.to === "/cart" && totalItems > 0 && (
            <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
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
              className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 text-sm font-medium transition-colors rounded-sm"
            >
              Dashboard
            </Link>
          )}
          {isEmployee && (
            <Link
              to="/employee"
              className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 text-sm font-medium transition-colors rounded-sm"
            >
              My Orders
            </Link>
          )}
        </>
      ) : (
        <>
          <Link
            to="/admin/login"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 text-sm font-medium transition-colors rounded-sm"
          >
            Admin Login
          </Link>
          <Link
            to="/employee/login"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 text-sm font-medium transition-colors rounded-sm"
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
      <nav className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm"
            >
              E-Com Store
            </Link>
            <div className="hidden items-center gap-4 md:flex">
              <NavItems />
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/cart"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "relative",
              )}
            >
              <HugeiconsIcon icon={ShoppingBag03Icon} size={20} />
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              >
                <HugeiconsIcon icon={Menu01Icon} size={20} />
              </SheetTrigger>
              <SheetContent side="right">
                <div className="mt-8 flex flex-col gap-4">
                  <NavItems>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "self-end",
                      )}
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
