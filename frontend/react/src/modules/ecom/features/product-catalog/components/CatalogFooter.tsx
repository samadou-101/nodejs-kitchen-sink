import { Link } from "react-router-dom";

export function CatalogFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-foreground">
              <span className="block h-3 w-3 rotate-45 bg-primary" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              E-Com Store
            </span>
          </Link>
          <nav className="flex gap-6 text-sm text-primary-foreground/70">
            <Link
              to="/"
              className="transition-colors hover:text-primary-foreground"
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="transition-colors hover:text-primary-foreground"
            >
              Cart
            </Link>
            <Link
              to="/track"
              className="transition-colors hover:text-primary-foreground"
            >
              Track Order
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
          &copy; {year} E-Com Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
