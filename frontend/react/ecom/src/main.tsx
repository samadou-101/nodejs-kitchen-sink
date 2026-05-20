import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Providers } from "#shared/api/query-provider";
import { router } from "#shared/api/router";
import { Toaster } from "#components/components/ui/sonner";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
      <Toaster />
    </Providers>
  </StrictMode>,
);
