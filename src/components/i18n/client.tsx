"use client";

import { createContext, useState, type ReactNode } from "react";
import { deleteCookie, getCookie, setCookie } from "../utilities/cookie";
import { DEFAULT_LANG, LANG_KEY, LANGS } from "./consts";

export const setLang = (lang: LANG) => {
  setCookie(LANG_KEY, lang, { path: "/" });
  window.location.reload();
};

export const clearLang = (preventReload?: boolean) => {
  deleteCookie(LANG_KEY);
  if (!preventReload) window.location.reload();
};

export const getLangs = () => {
  return getCookie(LANG_KEY) as unknown as Readonly<Array<LANG>>;
};

type LangProviderContextProps = {
  lang: LANG;
  langs: Readonly<Array<LANG>>;
  get: (kind: string, key: string, arg: { [v: string]: any }) => string;
};

const LangProviderContext = createContext<LangProviderContextProps>({
  lang: DEFAULT_LANG,
  langs: LANGS,
  get: () => "",
});

export const LangProvider = (props: { children: ReactNode }) => {
  const [cache, setCache] = useState<Partial<LangCache>>({});
  const langs = getLangs();

  return (
    <LangProviderContext.Provider value={{
      lang: langs[0],
      langs,
      get: (kind, key, arg) => {
        // for (let i = 0, il = langs.length; i < il; i++) {
        //   const func = cache[langs[i]]?.[kind]?.[key];
        //   if (func) return func(arg);
        // }
        // return cache[DEFAULT_LANG]?.[kind]?.[key](arg);
        return "";
      },
    }}>
      {props.children}
    </LangProviderContext.Provider>
  );
};
