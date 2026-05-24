import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@visurena/design-tokens": path.resolve(__dirname, "../../packages/design-tokens/src"),
      "@visurena/core": path.resolve(__dirname, "../../packages/core/src"),
      "@visurena/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
