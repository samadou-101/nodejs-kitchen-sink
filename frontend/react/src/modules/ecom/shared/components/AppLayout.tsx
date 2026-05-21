import { useState, type ReactNode } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag03Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "#ecom/shared/api/auth-provider";
import { useCart } from "#ecom/features/shopping-cart/hooks/use-cart";
import { cn } from "#components/lib/utils";
import { buttonVariants } from "#components/lib/button-variants";
import { Sheet, SheetContent, SheetTrigger } from "#components/ui/sheet";

const navLinkDefs = [
  { to: "/", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/track", label: "Track Order" },
];

function NavItems({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isAdmin, isEmployee, isLoading } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  function isActive(to: string) {
    return to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);
  }

  return (
    <>
      {navLinkDefs.map((link) => {
        const active = isActive(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "focus-visible:ring-ring/50 relative flex items-center gap-2 rounded-sm text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
              active
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
            {link.to === "/cart" && totalItems > 0 && (
              <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                {totalItems}
              </span>
            )}
            {active && (
              <span className="bg-foreground absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
            )}
          </Link>
        );
      })}
      {children}
      {isLoading ? null : isAuthenticated ? (
        (isAdmin || isEmployee) && (
          <>
            <span
              className="bg-border hidden h-4 w-px md:block"
              aria-hidden="true"
            />
            <hr className="border-border md:hidden" aria-hidden="true" />
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "focus-visible:ring-ring/50 relative rounded-sm text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
                  isActive("/admin")
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Dashboard
                {isActive("/admin") && (
                  <span className="bg-foreground absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
                )}
              </Link>
            )}
            {isEmployee && (
              <Link
                to="/employee"
                className={cn(
                  "focus-visible:ring-ring/50 relative rounded-sm text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
                  isActive("/employee")
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                My Orders
                {isActive("/employee") && (
                  <span className="bg-foreground absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
                )}
              </Link>
            )}
          </>
        )
      ) : (
        <>
          <span
            className="bg-border hidden h-4 w-px md:block"
            aria-hidden="true"
          />
          <hr className="border-border md:hidden" aria-hidden="true" />
          <Link
            to="/admin/login"
            className={cn(
              "focus-visible:ring-ring/50 rounded-sm text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
              isActive("/admin/login")
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Admin Login
          </Link>
          <Link
            to="/employee/login"
            className={cn(
              "focus-visible:ring-ring/50 rounded-sm text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
              isActive("/employee/login")
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
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
      <nav className="bg-background/95 sticky top-0 z-40 border-b shadow-xs backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-sm text-lg font-bold tracking-tight focus-visible:ring-3 focus-visible:outline-none"
            >
              <span className="bg-foreground flex h-5 w-5 items-center justify-center rounded-md">
                <span className="bg-background block h-2 w-2 rotate-45" />
              </span>
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
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
              >
                <HugeiconsIcon icon={Menu01Icon} size={20} />
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <span className="bg-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
                      <span className="bg-background block h-2.5 w-2.5 rotate-45" />
                    </span>
                    <span className="text-base font-bold tracking-tight">
                      E-Com Store
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <main className="max-w-8xl mx-auto px-4 py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
