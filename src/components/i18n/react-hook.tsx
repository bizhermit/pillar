"use client";

import { createContext, type ReactNode, use } from "react";
import { clearLang, setLangs } from "./client";
import { LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";
import { parseLangs } from "./utilities";

// NOTE developビルドエラー回避用
process.env.NODE_ENV.startsWith("dev") && typeof window === "undefined" && parseLangs((await require("next/headers").cookies()).get(LANG_KEY)?.value);

interface LangContextProps extends LangAccessor {
  set: (langs: Array<Lang>) => void
  reset: () => void
}

const langCache = {};
const LangContext = createContext<LangContextProps>(null!);

type LangProviderProps = {
  langs: Array<Lang>;
  children: ReactNode;
};

export const LangProvider = (props: LangProviderProps) => {
  const lang = langFactoryCore(props.langs, langCache) as LangContextProps;
  lang.set = (langs: Array<Lang>) => setLangs(langs);
  lang.reset = () => clearLang();

  return (
    <LangContext.Provider value={lang}>
      {props.children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  return use(LangContext);
};
