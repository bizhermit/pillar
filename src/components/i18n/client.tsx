"use client";

import { deleteCookie, getCookie, setCookie } from "../utilities/cookie";
import { DEFAULT_LANG, LANG_KEY } from "./consts";
import { parseLangs } from "./utilities";

export const setLang = (lang: Lang) => {
  setCookie(LANG_KEY, lang);
  window.location.reload();
};

export const clearLang = (preventReload?: boolean) => {
  deleteCookie(LANG_KEY);
  if (!preventReload) window.location.reload();
};

export const getLangs = () => {
  return parseLangs(getCookie(LANG_KEY)) ?? [DEFAULT_LANG];
};

export const setLangs = (langs: Array<Lang>) => {
  setCookie(LANG_KEY, langs.join(","));
  window.location.reload();
};

