const today = new Date();
const pad = (v: number | string) => `00${v}`.slice(-2);

const prefix = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDay())}-${pad(today.getHours())}${pad(today.getMinutes())}${pad(today.getSeconds())}`;
let count = 0;


export const getContext = (params: { browserName: string }) => {
  return {
    ssPath: (name?: string) => {
      return `.playwright/${prefix}/${params.browserName || "default"}/${(`0000` + count++).slice(-4)}_${name?.replace(/^\//, "") || `${Date.now()}`}.png`;
    },
  };
};
