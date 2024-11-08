"use client";

import { createContext, ReactNode, use } from "react";
import { getLangs } from "./client";
import { LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";
import { parseLangs } from "./utilities";

const langs = typeof window === "undefined" ?
  parseLangs((await require("next/headers").cookies()).get(LANG_KEY)?.value) :
  getLangs();

export const lang = langFactoryCore(langs);

type LangContextProps = typeof lang;
const LangContext = createContext<LangContextProps>(lang);

type LangProviderProps = {
  langs: Array<Lang>;
  children: ReactNode;
};

export const LangProvider = (props: LangProviderProps) => {
  const lang = langFactoryCore(props.langs);

  return (
    <LangContext.Provider value={lang}>
      {props.children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  return use(LangContext);
};
