import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "#components": path.resolve(__dirname, "src/components"),
      "#lib": path.resolve(__dirname, "src/lib"),
      "#hooks": path.resolve(__dirname, "src/hooks"),
      "#ecom": path.resolve(__dirname, "src/modules/ecom"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/modules/ecom/test/setup.ts",
    css: false,
  },
});
