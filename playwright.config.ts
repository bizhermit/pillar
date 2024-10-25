import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const isDev = (process.env.NODE_ENV || "").startsWith("dev");
const loadEnv = (name: string) => {
  const fullName = path.resolve(__dirname, name);
  if (!fs.existsSync(fullName)) return false;
  dotenv.config({ path: fullName, override: true });
  return true;
};

loadEnv(".env");
loadEnv(`.env.${isDev ? "development" : "production"}`);
loadEnv(".env.local");
loadEnv(`.env.${isDev ? "development" : "production"}.local`);

const webServerUrl = `http://localhost:${process.env.NEXT_PORT || "3000"}`;

const now = new Date();
const pad = (v: number | string) => `00${v}`.slice(-2);
const taskId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDay())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

const outputDir = path.join(".playwright");

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  outputDir,
  snapshotDir: path.join(outputDir, taskId),
  use: {
    baseURL: webServerUrl,
    trace: "on-first-retry",
    launchOptions: {
      slowMo: 1000,
    },
  },
  projects: [
    {
      name: "chromium-ja",
      use: {
        ...devices["Desktop Chrome"],
        locale: "ja"
      },
    },
    {
      name: "chromium-enUS",
      use: {
        ...devices["Desktop Chrome"],
        locale: "en-US"
      },
    },
    {
      name: "chromium-en",
      use: {
        ...devices["Desktop Chrome"],
        locale: "en"
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* mobile viewports. */
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },
    /* Test against branded browsers. */
    // {
    //   name: "Microsoft Edge",
    //   use: { ...devices["Desktop Edge"], channel: "msedge" },
    // },
    // {
    //   name: "Google Chrome",
    //   use: { ...devices["Desktop Chrome"], channel: "chrome" },
    // },
  ],
  // webServer: {
  //   command: isDev ? "npm run dev" : "npm run next",
  //   url: webServerUrl,
  //   reuseExistingServer: !process.env.CI,
  // },
});
