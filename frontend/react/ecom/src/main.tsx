import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <h1 className="m-4 bg-red-200">Hello World</h1>
  </StrictMode>,
);
