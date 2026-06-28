import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // @stellar/stellar-sdk references the Node `global` identifier; map it to the
  // browser's `globalThis` so the production build doesn't crash. (Buffer is
  // polyfilled at runtime in src/polyfills.ts.)
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
