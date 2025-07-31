import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: "chromium" }, { browser: "firefox" }],
    },
    coverage: {
      provider: "istanbul",
      include: ["src/Jimple.ts"],
      reporter: ["lcov", "html"],
    },
  },
});
