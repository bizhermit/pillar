import type { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestInfo } from "@playwright/test";

const now = new Date(Date.now() - process.uptime());
const pad = (v: number | string) => `00${v}`.slice(-2);

const prefix = process.env.PLAYWRIGHT_TASK_ID || `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDay())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
let count = 0;

type PlaywrightArgs = PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;
type PickPartial<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type PlaywrightContextArgs = PickPartial<PlaywrightArgs, "page">;

export const getPlaywrightPageContext = (args: PlaywrightContextArgs, testInfo: TestInfo) => {
  return {
    saveSS: (name?: string) => {
      return args.page.screenshot({
        path: `test-results/${prefix}/${testInfo.project.name || args.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`,
        fullPage: true,
      });
    },
  };
};
