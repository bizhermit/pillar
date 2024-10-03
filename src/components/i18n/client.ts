import { deleteCookie, getCookie, setCookie } from "../utilities/cookie";
import { LANG_KEY } from "./consts";

export const setLang = (lang: LANG) => {
  setCookie(LANG_KEY, lang, { path: "/" });
  window.location.reload();
};

export const clearLang = (preventReload?: boolean) => {
  deleteCookie(LANG_KEY);
  if (!preventReload) window.location.reload();
};

export const getLang = () => {
  return getCookie(LANG_KEY);
};
