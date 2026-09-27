import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": path.resolve(__dirname, "src/test/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.integration.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
