import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_KEY } from "./consts";
import { langFactoryCore } from "./core";

export const langFactory = async (langs?: Array<Lang>) => {
  return langFactoryCore(langs ?? ((await cookies()).get(LANG_KEY)?.value.split(",") as Array<Lang>) ?? [DEFAULT_LANG]);
};
