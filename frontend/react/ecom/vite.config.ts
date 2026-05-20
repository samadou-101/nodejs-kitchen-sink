import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "#components": path.resolve(__dirname, "src/components"),
      "#lib": path.resolve(__dirname, "src/lib"),
      "#hooks": path.resolve(__dirname, "src/hooks"),
    },
  },
});
