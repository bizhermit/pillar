export const sleep = (wait: number) => new Promise<void>(r => setTimeout(r, wait));
