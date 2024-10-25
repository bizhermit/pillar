import type { Locator, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestInfo } from "@playwright/test";
import { readFileSync } from "fs";

type PlaywrightArgs = PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;
type PickPartial<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type PlaywrightContextArgs = PickPartial<PlaywrightArgs, "page">;

let count = 0;

export const getPlaywrightPageContext = ({ page, ...args }: PlaywrightContextArgs, testInfo: TestInfo) => {
  const waitLoading = async () => {
    await page.waitForFunction(() => {
      return document.querySelectorAll(`div[class^="loading-"]`).length === 0;
    });
  };

  const waitImgs = async () => {
    const imgs = await page.locator("img").all();
    if (imgs.length === 0) return;
    for await (const img of imgs) {
      await img.waitFor({ state: "visible" });
    }
    await page.evaluate(() => {
      return Array.from(document.images).every(img => img.complete && img.naturalHeight !== 0);
    });
  };

  const waitLoadable = async () => {
    await page.waitForFunction(() => {
      return document.querySelectorAll(`div[data-loaded="false"]`).length === 0;
    });
  };

  const waitShowedDialog = async () => {
    await page.waitForFunction(() => {
      return document.querySelectorAll(`dialog[open],dialog:popover-open`).length > 0;
    });
  };

  return {
    waitLoading,
    waitImgs,
    waitLoadable,
    waitShowedDialog,
    screenShot: async (name?: string) => {
      await waitLoading();
      await waitImgs();
      await waitLoadable();
      await page.screenshot({
        path: `${testInfo.snapshotDir}/${testInfo.project.name || args.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`,
        fullPage: true,
      });
    },
    form: () => {
      const waitLoadable = async (selector: string) => {
        await page.waitForFunction(async ({ selector }) => {
          const elem = document.querySelector(selector);
          return elem != null && elem.getAttribute("data-loaded") === "true";
        }, { selector });
      };

      const textBox = async (name: string, value: string | number) => {
        const selector = `input[type="text"][data-name="${name}"]`;
        await page.waitForSelector(selector);
        const locator = page.locator(selector);
        await locator.focus();
        await locator.fill(String(value));
        await locator.blur();
      };

      const checkBox = async (name: string, checked: boolean) => {
        const selector = `input[type="checkbox"][data-name="${name}"]`;
        await page.waitForSelector(selector);
        const locator = page.locator(selector);
        await locator.setChecked(checked, { force: true });
      };

      return {
        textBox,
        numberBox: textBox,
        selectBox: async (name: string, label: string) => {
          const selector = `div[data-name="${name}"][data-loaded]`;
          await waitLoadable(selector);
          const locator = page.locator(`${selector}>input[type="text"]`);
          await locator.focus();
          await locator.fill(label);
          await locator.blur();
        },
        checkBox,
        toggleSwitch: checkBox,
        radioButtons: async (name: string, label: string) => {
          const selector = `div[data-name="${name}"][data-loaded]`;
          await waitLoadable(selector);
          const locator = page.locator(`${selector}>label`, { hasText: label });
          await locator.click();
        },
        checkList: async (name: string, labels: Array<string>) => {
          const selector = `div[data-name="${name}"][data-loaded]`;
          await waitLoadable(selector);
          for await (const label of labels) {
            const locator = page.locator(`${selector}>label`, { hasText: label });
            await locator.click();
          }
        },
        dateBox: async (name: string, date: { y?: number | null; m?: number | null; d?: number | null; }) => {
          let selector = `input[data-name="${name}_y"]`;
          await page.waitForSelector(selector);
          let locator = page.locator(selector);
          await locator.focus();
          await locator.fill(date.y == null ? "" : String(date.y));
          selector = `input[data-name="${name}_m"]`;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(date.m == null ? "" : String(date.m));
          }
          selector = `input[data-name="${name}_d"]`;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            locator.focus();
            await locator.fill(date.d == null ? "" : String(date.d));
          }
          await locator.blur();
        },
        timeBox: async (name: string, time: { h?: number | null; m?: number | null; s?: number | null; }) => {
          let selector = `input[data-name="${name}_h"]`;
          let locator: Locator | null = null;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(time.h == null ? "" : String(time.h));
          }
          selector = `input[data-name="${name}_m"]`;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(time.m == null ? "" : String(time.m));
          }
          selector = `input[data-name="${name}_s"]`;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(time.s == null ? "" : String(time.s));
          }
          await locator?.blur();
        },
        fileChoose: async (name: string, filePath: string) => {
          const selector = `input[type="file][data-name="${name}"]`;
          await page.waitForSelector(selector);
          const fileChooserPromise = page.waitForEvent("filechooser");
          await page.locator(selector).click();
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles(filePath);
        },
        fileDrop: async (name: string, file: { path: string; name: string; type: string; }) => {
          const selector = `div[data-name="${name}"][role="button"]`;
          await page.waitForSelector(selector);

          const buf = readFileSync(file.path).toString("base64");
          const dataTransfer = await page.evaluateHandle(async ({ buffer, fileName, fileType }) => {
            const dt = new DataTransfer();
            const blob = await (await fetch(buffer)).blob();
            const f = new File([blob], fileName, { type: fileType });
            dt.items.add(f);
            return dt;
          }, {
            buffer: `data:application/octet-stream;base64,${buf}`,
            fileName: file.name,
            fileType: file.type,
          });

          await page.locator(selector).dispatchEvent("drop", { dataTransfer });
        },
      };
    },
  };
};
