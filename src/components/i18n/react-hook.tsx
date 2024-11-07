"use client";

import { createContext, ReactNode, use } from "react";
import { getLangs } from "./client";
import { LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";

const langs = typeof window === "undefined" ?
  (await require("next/headers").cookies()).get(LANG_KEY)?.value.split(",") as Array<Lang> :
  getLangs();

export const lang = langFactoryCore(langs);

type LangContextProps = typeof lang;
const LangContext = createContext<LangContextProps>(lang);

export const LangProvider = (props: { children: ReactNode }) => {
  const lang = langFactoryCore(getLangs());

  return (
    <LangContext.Provider value={lang}>
      {props.children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  return use(LangContext);
};
