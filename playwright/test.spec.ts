import test from "@playwright/test";
import { ssPath } from "save-screen-shot";

test("test", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: ssPath(), fullPage: true });
  await page.locator("a").filter({ hasText: "sandbox" }).click();
  await page.waitForURL("/sandbox");
  await page.waitForSelector("nav");
  await page.screenshot({ path: ssPath(), fullPage: true });
});
