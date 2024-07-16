export const joinClassNames = (...classNames: Array<string | null | undefined>) => classNames.join(" ").replace(/[ ]{2,}/g, " ").trim() || undefined;
