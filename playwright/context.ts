import type { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestInfo } from "@playwright/test";

type PlaywrightArgs = PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;
type PickPartial<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type PlaywrightContextArgs = PickPartial<PlaywrightArgs, "page">;

let count = 0;

export const getPlaywrightPageContext = (args: PlaywrightContextArgs, testInfo: TestInfo) => {
  return {
    saveSS: async (name?: string) => {
      await args.page.screenshot({
        path: `${testInfo.snapshotDir}/${testInfo.project.name || args.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`,
        fullPage: true,
      });
    },
    waitImgs: async () => {
      const imgs = await args.page.locator("img").all();
      for await (const img of imgs) {
        await img.waitFor({ state: "visible" });
      }
      await args.page.evaluate(() => {
        return Array.from(document.images).every(img => img.complete && img.naturalHeight !== 0);
      });
    },
  };
};
