import { langFactoryCore } from "./core";

const langs = typeof window === "undefined" ?
  (await require("next/headers").cookies()) :
  (require("./client").getLangs());

export const lang = langFactoryCore(langs);
