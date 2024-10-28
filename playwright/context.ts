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
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `${testInfo.snapshotDir}/${testInfo.project.name || args.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`,
        fullPage: true,
      });
    },
    form: (formSelector?: string) => {
      const fselector = (s: string) => `${formSelector ? `${formSelector} ` : ""}${s}`;

      const waitLoadable = async (selector: string) => {
        await page.waitForFunction(async ({ selector }) => {
          const elem = document.querySelector(selector);
          return elem != null && elem.getAttribute("data-loaded") === "true";
        }, { selector });
      };

      const textBox = async (name: string, value: string | number) => {
        const selector = fselector(`input[data-name="${name}"]:is([type="text"],[type="password"])`);
        await page.waitForSelector(selector);
        const locator = page.locator(selector);
        await locator.focus();
        await locator.fill(String(value));
        await locator.blur();
      };

      const checkBox = async (name: string, checked: boolean) => {
        const selector = fselector(`input[type="checkbox"][data-name="${name}"]`);
        await page.waitForSelector(selector);
        const locator = page.locator(selector);
        await locator.setChecked(checked, { force: true });
      };

      return {
        textBox,
        numberBox: textBox,
        textArea: async (name: string, value: string) => {
          const selector = fselector(`textarea[data-name="${name}"]`);
          await page.waitForSelector(selector);
          const locator = page.locator(selector);
          await locator.focus();
          await locator.fill(String(value));
          await locator.blur();
        },
        selectBox: async (name: string, label: string) => {
          const selector = fselector(`div[data-name="${name}"][data-loaded]`);
          await waitLoadable(selector);
          const locator = page.locator(`${selector}>input[type="text"]`);
          await locator.focus();
          await locator.fill(label);
          await locator.blur();
        },
        checkBox,
        toggleSwitch: checkBox,
        radioButtons: async (name: string, label: string) => {
          const selector = fselector(`div[data-name="${name}"][data-loaded]`);
          await waitLoadable(selector);
          const locator = page.locator(`${selector}>label`, { hasText: label });
          await locator.click();
        },
        checkList: async (name: string, labels: Array<string>) => {
          const selector = fselector(`div[data-name="${name}"][data-loaded]`);
          await waitLoadable(selector);
          for await (const label of labels) {
            const locator = page.locator(`${selector}>label`, { hasText: label });
            await locator.click();
          }
        },
        dateBox: async (name: string, date: { y?: number | null; m?: number | null; d?: number | null; }) => {
          let selector = fselector(`input[data-name="${name}_y"]`);
          await page.waitForSelector(selector);
          let locator = page.locator(selector);
          await locator.focus();
          await locator.fill(date.y == null ? "" : String(date.y));
          selector = fselector(`input[data-name="${name}_m"]`);
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(date.m == null ? "" : String(date.m));
          }
          selector = fselector(`input[data-name="${name}_d"]`);
          if (await page.$(selector)) {
            locator = page.locator(selector);
            locator.focus();
            await locator.fill(date.d == null ? "" : String(date.d));
          }
          await locator.blur();
        },
        timeBox: async (name: string, time: { h?: number | null; m?: number | null; s?: number | null; }) => {
          let selector = fselector(`input[data-name="${name}_h"]`);
          let locator: Locator | null = null;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(time.h == null ? "" : String(time.h));
          }
          selector = fselector(`input[data-name="${name}_m"]`);
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(time.m == null ? "" : String(time.m));
          }
          selector = fselector(`input[data-name="${name}_s"]`);
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(time.s == null ? "" : String(time.s));
          }
          await locator?.blur();
        },
        slider: async (name: string, value: number, options?: { min?: number; max?: number; }) => {
          const sliderSelector = fselector(`div.ipt-slider[data-name="${name}"]`);
          const thumbSelector = `${sliderSelector} .ipt-slider-thumb`;
          await page.waitForSelector(thumbSelector);
          const thumbElem = (await page.$(thumbSelector))!;
          await thumbElem.scrollIntoViewIfNeeded();
          await thumbElem.click();
          const thumbRect = (await thumbElem.boundingBox())!;
          const margin = Math.round(thumbRect.width / 2);
          await page.mouse.move(thumbRect.x + margin, thumbRect.y + margin);
          await page.mouse.down();
          const min = options?.min ?? 0;
          const max = options?.max ?? 100;
          const rate = Math.round((value - min) * 100 / (max - min)) / 100;
          const railElem = (await page.$(`${sliderSelector} .ipt-slider-rail`))!;
          const railRect = (await railElem.boundingBox())!;
          await page.mouse.move(railRect.x + railRect.width * rate + margin, thumbRect.y + margin);
          await page.mouse.up();
        },
        fileChoose: async (name: string, filePath: string) => {
          const selector = fselector(`input[type="file"][data-name="${name}"]`);
          await page.waitForSelector(selector, { state: "attached" });
          const fileChooserPromise = page.waitForEvent("filechooser");
          await page.locator(selector).dispatchEvent("click");
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles(filePath);
        },
        fileDrop: async (name: string, file: { path: string; name?: string; type?: string; }) => {
          const selector = fselector(`div[data-name="${name}"][role="button"]`);
          await page.waitForSelector(selector, { state: "attached" });

          const buf = readFileSync(file.path).toString("base64");
          const dataTransfer = await page.evaluateHandle(async ({ base64, fileName, fileType }) => {
            const bin = atob(base64.replace(/^.*,/, ""));
            const buffer = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) {
              buffer[i] = bin.charCodeAt(i);
            }
            const blob = new Blob([buffer.buffer], { type: fileType });
            const f = new File([blob], fileName, { type: fileType });

            const dt = new DataTransfer();
            try {
              dt.items.add(f);
            } catch {
              // webkit not supported.
            }
            return dt;
          }, {
            base64: `data:application/octet-stream;base64,${buf}`,
            fileName: file.name || file.path,
            fileType: file.type,
          });

          await page.locator(selector).dispatchEvent("drop", { dataTransfer });
          dataTransfer.dispose();
        },
        sign: async (name: string) => {
          const selector = fselector(`canvas[data-name="${name}"]`);
          await page.waitForSelector(selector);
          const elem = (await page.$(selector))!;
          await elem.scrollIntoViewIfNeeded();
          const rect = (await elem.boundingBox())!;
          const y = Math.round(rect.y + rect.height / 2);
          const startX = Math.round(rect.x + rect.width * 0.3);
          const endX = Math.round(rect.x + rect.width * 0.7);
          await page.mouse.move(startX, y);
          await page.mouse.down();
          await page.mouse.move(endX, y);
          await page.mouse.up();
        },
        submit: async () => {
          const selector = fselector(`button[type="submit"]:not(:disabled)`);
          await page.waitForSelector(selector)
          await page.locator(selector).click();
        },
        reset: async () => {
          const selector = fselector(`button[type="reset"]`);
          if (!await page.$(selector)) return;
          await page.waitForSelector(`${selector}:not(:disabled)`);
          await page.locator(selector).click();
        },
      };
    },
  };
};
