// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],

    // ✅ só procura testes no seu código
    include: [
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
      "lib/**/*.test.ts",
      "lib/**/*.test.tsx",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
    ],

    // ✅ exclui tudo que costuma “vazar”
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/cypress/**",
      "**/playwright/**",
      "**/AppData/**",
      "**/npm-cache/**",
      "**/Cypress/**",
    ],

    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },

  // ✅ como seu root já é /src, o @ deve apontar pra ele mesmo
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});