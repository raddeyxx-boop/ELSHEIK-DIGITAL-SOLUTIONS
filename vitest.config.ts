import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"], exclude: ["tests/e2e/**", "node_modules/**"] },
  resolve: { alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    // Next resolves this marker to an empty module on the server; tests do the same.
    "server-only": fileURLToPath(new URL("./node_modules/next/dist/compiled/server-only/empty.js", import.meta.url)),
  } },
});
