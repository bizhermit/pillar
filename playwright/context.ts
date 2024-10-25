import type { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestInfo } from "@playwright/test";

type PlaywrightArgs = PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;
type PickPartial<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type PlaywrightContextArgs = PickPartial<PlaywrightArgs, "page">;

let count = 0;

export const getPlaywrightPageContext = (args: PlaywrightContextArgs, testInfo: TestInfo) => {
  return {
    saveSS: (name?: string) => {
      return args.page.screenshot({
        path: `${testInfo.snapshotDir}/${testInfo.project.name || args.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`,
        fullPage: true,
      });
    },
  };
};
