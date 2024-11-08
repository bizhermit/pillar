import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";
import { parseLangs } from "./utilities";

export const langFactory = async (langs?: Array<Lang>) => {
  return langFactoryCore(langs ?? parseLangs((await cookies()).get(LANG_KEY)?.value) ?? [DEFAULT_LANG]);
};
