import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag03Icon,
  Menu01Icon,
  ArrowDownDoubleIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "#ecom/shared/api/auth-provider";
import { useCart } from "#ecom/features/shopping-cart/hooks/use-cart";
import { cn } from "#components/lib/utils";
import { buttonVariants } from "#components/lib/button-variants";
import { Sheet, SheetContent, SheetTrigger } from "#components/ui/sheet";

const navLinkDefs = [
  { to: "/", label: "Products" },
  { to: "/about", label: "About Us" },
  { to: "/track", label: "Track Order" },
];

function HeaderLogo() {
  return (
    <Link
      to="/"
      className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-sm focus-visible:ring-3 focus-visible:outline-none"
    >
      <span className="bg-foreground flex h-5 w-5 items-center justify-center rounded-md">
        <span className="bg-background block h-2 w-2 rotate-45" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">E-Com Store</span>
    </Link>
  );
}

function NavLinks() {
  const location = useLocation();

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
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
              "focus-visible:ring-ring/50 relative flex items-center gap-2 rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
              active
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
            {active && (
              <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
            )}
          </Link>
        );
      })}
    </>
  );
}

function HeaderActions() {
  const { isAuthenticated, isAdmin, isEmployee, isLoading } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
    <div className="flex items-center gap-2">
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

      {isLoading ? null : isAuthenticated ? (
        <>
          {(isAdmin || isEmployee) && (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "focus-visible:ring-ring/50 relative rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                    isActive("/admin")
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Dashboard
                  {isActive("/admin") && (
                    <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
                  )}
                </Link>
              )}
              {isEmployee && (
                <Link
                  to="/employee"
                  className={cn(
                    "focus-visible:ring-ring/50 relative rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                    isActive("/employee")
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  My Orders
                  {isActive("/employee") && (
                    <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
                  )}
                </Link>
              )}
              <span className="bg-border h-4 w-px" aria-hidden="true" />
              <button
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground hover:text-foreground text-sm font-semibold",
                )}
              >
                Logout
              </button>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm font-semibold">
            EN
          </span>
          <HugeiconsIcon
            icon={ArrowDownDoubleIcon}
            size={14}
            className="text-muted-foreground"
          />
        </div>
      )}
    </div>
  );
}

function MobileNav() {
  const { isAuthenticated, isAdmin, isEmployee, isLoading } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
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
              {navLinkDefs.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "focus-visible:ring-ring/50 relative flex items-center gap-2 rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                      active
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
                    )}
                  </Link>
                );
              })}

              <hr className="border-border my-2" aria-hidden="true" />

              {isLoading ? null : isAuthenticated ? (
                (isAdmin || isEmployee) && (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "focus-visible:ring-ring/50 relative rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                          isActive("/admin")
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Dashboard
                      </Link>
                    )}
                    {isEmployee && (
                      <Link
                        to="/employee"
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "focus-visible:ring-ring/50 relative rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                          isActive("/employee")
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        My Orders
                      </Link>
                    )}
                    <button
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "w-full justify-start text-sm font-semibold",
                      )}
                    >
                      Logout
                    </button>
                  </>
                )
              ) : (
                <>
                  <Link
                    to="/admin/login"
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "focus-visible:ring-ring/50 rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                      isActive("/admin/login")
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Admin Login
                  </Link>
                  <Link
                    to="/employee/login"
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "focus-visible:ring-ring/50 rounded-sm text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                      isActive("/employee/login")
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Employee Login
                  </Link>
                </>
              )}

              <button
                onClick={() => setSheetOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "self-end",
                )}
              >
                Close
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function EcomHeader() {
  return (
    <nav className="bg-background/95 sticky top-0 z-40 border-b-2 shadow-md backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
        <div className="hidden w-full md:grid md:grid-cols-3 md:items-center">
          <div className="justify-self-start">
            <HeaderLogo />
          </div>
          <div className="flex items-center gap-6 justify-self-center">
            <NavLinks />
          </div>
          <div className="justify-self-end">
            <HeaderActions />
          </div>
        </div>

        <div className="flex w-full items-center justify-between md:hidden">
          <HeaderLogo />
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}
