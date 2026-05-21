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
      "#shared": path.resolve(__dirname, "src/shared"),
      "#features": path.resolve(__dirname, "src/features"),
      "#test": path.resolve(__dirname, "src/test"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
