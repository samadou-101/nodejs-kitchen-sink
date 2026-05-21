/* eslint-disable @typescript-eslint/no-unused-vars */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { Toaster } from "#components/ui/sonner";
import "./global.css";
import Overview from "./modules/overview/Overview";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <App /> */}
    <Overview />
    <Toaster />
  </StrictMode>,
);
