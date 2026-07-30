import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "test-results",
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFileName}/{projectName}/{arg}{ext}",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [
        ["line"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ]
    : "line",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "light",
    deviceScaleFactor: 1,
    headless: true,
    locale: "ko-KR",
    serviceWorkers: "block",
    timezoneId: "Asia/Seoul",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command:
      "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
