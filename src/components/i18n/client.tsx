"use client";

import { deleteCookie, getCookie, setCookie } from "../utilities/cookie";
import { DEFAULT_LANG, LANG_KEY } from "./consts";

export const setLang = (lang: Lang) => {
  setCookie(LANG_KEY, lang, { path: "/" });
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
  setCookie(LANG_KEY, langs.join(","), { path: "/" });
};
