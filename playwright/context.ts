import type { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestInfo } from "@playwright/test";

type PlaywrightArgs = PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;
type PickPartial<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type PlaywrightContextArgs = PickPartial<PlaywrightArgs, "page">;

let count = 0;

export const getPlaywrightPageContext = (args: PlaywrightContextArgs, testInfo: TestInfo) => {
  const waitLoading = async () => {
    await args.page.waitForFunction(() => {
      return document.querySelectorAll(`div[class^="loading-"]`).length === 0;
    });
  };

  const waitImgs = async () => {
    const imgs = await args.page.locator("img").all();
    if (imgs.length === 0) return;
    for await (const img of imgs) {
      await img.waitFor({ state: "visible" });
    }
    await args.page.evaluate(() => {
      return Array.from(document.images).every(img => img.complete && img.naturalHeight !== 0);
    });
  };

  const waitLoadable = async () => {
    await args.page.waitForFunction(() => {
      return document.querySelectorAll(`div[data-loaded="false"]`).length === 0;
    });
  };

  const waitShowedDialog = async () => {
    await args.page.waitForFunction(() => {
      return document.querySelectorAll(`dialog[open],dialog:popover-open`).length > 0;
    });
  };

  const textBox = async (name: string, value: string | number) => {
    return await args.page.locator(`input[type="text"][data-name="${name}"]`).fill(String(value));
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
      await args.page.screenshot({
        path: `${testInfo.snapshotDir}/${testInfo.project.name || args.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`,
        fullPage: true,
      });
    },
    textBox,
    numberBox: textBox,
    selectBox: async (name: string, value: string | number) => {

    },
  };
};
