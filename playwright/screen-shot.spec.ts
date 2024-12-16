import test from "@playwright/test";
import { getPlaywrightPageContext } from "./context";

test("test", async ({ page, browserName }, testInfo) => {
  const { screenShot, form, selectTab } = getPlaywrightPageContext({ page, browserName }, testInfo);

  await page.goto("/");
  await screenShot();
  await page.locator("a").filter({ hasText: "sandbox" }).click();
  await page.waitForURL("/sandbox");
  await page.waitForSelector("nav");
  await screenShot();
  await page.locator("a.nav-menu-item").filter({ hasText: "React Elements" }).click();
  await page.waitForURL("/sandbox/element");
  await screenShot();

  selectTab("タブ２");
  const f = form();
  await f.textBox("sample_text", "playwright");
  await f.numberBox("sample_num", 1234);
  await f.checkBox("sample_bool", true);
  await f.toggleSwitch("toggle", true);
  await f.checkList("check-list", ["item-2", "item-0"]);
  await f.dateBox("date", { y: 2024, m: 12, d: 30 });
  await f.dateBox("date-after", { y: 2024, m: 12, d: 31 });
  await f.dateBox("month", { y: 2024, m: 12 });
  await f.dateBox("date-select", { y: 2024, m: 12, d: 31 });
  await f.dateBox("month-select", { y: 2024, m: 12 });
  await f.dateBox("sample_date", { y: 2024, m: 12, d: 31 });
  await f.timeBox("time", { h: 7, m: 30 });
  await f.textArea("text-area", "hoge\nfuga\npiyo");
  await f.radioButtons("radio", "item-1");
  await f.radioButtons("radio", "item-1");
  await f.fileChoose("file", "public/next.svg");
  await f.fileDrop("file-drop", { name: "public/vercel.svg", path: "public/vercel.svg", type: "image/svg" });
  // await f.fileChoose("file-drop", "public/vercel.svg");
  await f.textBox("credit-card", "1111222233334444");
  // await f.slider("slider", 88);
  await f.slider("slider", 13);
  // await f.slider("slider", 50);
  // await f.slider("slider", 0);
  // await f.slider("slider", 10);
  // await f.slider("slider", 100);
  await f.sign("elec-sign");
  await f.submit();
  await screenShot();
});
