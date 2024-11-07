import { LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";

const langs = typeof window === "undefined" ?
  (await require("next/headers").cookies()).get(LANG_KEY)?.value.split(",") as Array<Lang> :
  require("./client").getLangs();

export const lang = langFactoryCore(langs);
