import type { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestInfo } from "@playwright/test";

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
        await page.waitForFunction(() => {
          const elem = document.querySelector(selector);
          return elem && elem.getAttribute("data-loaded") === "true";
        });
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

      const radioButtons = async (name: string, label: string) => {
        const selector = `div[data-name="${name}"][data-loaded]`;
        await waitLoadable(selector);
        const locator = page.locator(`${selector}>label`, { hasText: label });
        await locator.click();
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
        radioButtons,
        checkList: radioButtons,
        dateBox: async (name: string, y: number, m: number, d: number) => {
          let selector = `input[data-name="${name}_y"]`;
          await page.waitForSelector(selector);
          let locator = page.locator(selector);
          await locator.focus();
          await locator.fill(String(y));
          selector = `input[data-name="${name}_m"]`;
          if (await page.$(selector)) {
            locator = page.locator(selector);
            await locator.focus();
            await locator.fill(String(m));

            selector = `input[data-name="${name}_d"]`;
            if (await page.$(selector)) {
              locator = page.locator(selector);
              locator.focus();
              await locator.fill(String(d));
            }
          }
          await locator.blur();
        },
      }
    },
  };
};
