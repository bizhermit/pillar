export const joinClassNames = (...classNames: Array<string | null | undefined>) => classNames.join(" ").replace(/[ ]{2,}/g, " ").trim() || undefined;

export const ifStr = (v: any, fallback?: string) => typeof v === "string" ? v : fallback;
