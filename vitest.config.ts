// vitest.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)), // 👈 mapa @ -> raiz do projeto
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup/vitest.setup.ts",
    css: false,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  esbuild: { jsx: "automatic" },
});
