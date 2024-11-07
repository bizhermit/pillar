"use client";

import { deleteCookie, getCookie, setCookie } from "../utilities/cookie";
import { DEFAULT_LANG, LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";

export const setLang = (lang: Lang) => {
  setCookie(LANG_KEY, lang);
  window.location.reload();
};

export const clearLang = (preventReload?: boolean) => {
  deleteCookie(LANG_KEY);
  if (!preventReload) window.location.reload();
};

export const getLangs = () => {
  return (getCookie(LANG_KEY)?.split(",") as unknown as Array<Lang>) ?? [DEFAULT_LANG];
};

export const setLangs = (langs: Array<Lang>) => {
  setCookie(LANG_KEY, langs.join(","));
};

const langs = typeof window === "undefined" ? (await require("next/headers").cookies()) : getLangs();

export const lang = langFactoryCore(langs);
