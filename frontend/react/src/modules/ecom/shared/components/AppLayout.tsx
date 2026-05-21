import { Outlet } from "react-router-dom";
import { EcomHeader } from "#ecom/shared/components/EcomHeader";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <EcomHeader />
      <main className="max-w-8xl mx-auto px-4 py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
