import test from "@playwright/test";
import { getPlaywrightPageContext } from "./context";

test("test", async ({ page, browserName }) => {
  const { saveSS } = getPlaywrightPageContext({ page, browserName });

  await page.goto("/");
  await saveSS();
  await page.locator("a").filter({ hasText: "sandbox" }).click();
  await page.waitForURL("/sandbox");
  await page.waitForSelector("nav");
  await saveSS();
  await page.locator("a.nav-menu-item").filter({ hasText: "React Elements" }).click();
  await page.waitForURL("/sandbox/element");
  await saveSS();
});
