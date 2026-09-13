import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
