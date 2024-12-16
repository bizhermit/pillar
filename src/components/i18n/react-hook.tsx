"use client";

import { createContext, type ReactNode, use } from "react";
import { clearLang, setLangs } from "./client";
import { langFactoryCore } from "./core";

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
