import { NavLink, Outlet } from "react-router-dom";

const sidebarLinks = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/payroll", label: "Payroll" },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-4">
        <h2 className="mb-4 text-lg font-bold">Admin Dashboard</h2>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/"
          className="mt-6 block rounded px-3 py-2 text-sm hover:bg-muted"
        >
          &larr; Back to Store
        </NavLink>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
