import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Stub Next.js modules so UI package tests run outside a Next.js app
      "next/link": path.resolve(__dirname, "__mocks__/next/link.tsx"),
    },
  },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
});
