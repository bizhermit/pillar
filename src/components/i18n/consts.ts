export const LANG_KEY = "lang";

export const DEFAULT_LANG = "ja";

export const LANGS = [
  DEFAULT_LANG,
  "en-US",
  "en",
] as const;

export const LANG_LABELS: { [v in typeof LANGS[number]]: string; } = {
  ja: "日本語",
  en: "English",
  "en-US": "English (US)",
};
