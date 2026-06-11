import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 10_000
  },
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run dev",
    reuseExistingServer: true,
    timeout: 120_000,
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
