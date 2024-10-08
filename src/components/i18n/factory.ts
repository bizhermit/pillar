import { getLangs } from "./client";
import { DEFAULT_LANG, LANG_KEY } from "./consts";

export const langFactory = (langs?: Array<Lang>) => {
  const $langs = (() => {
    if (langs != null) return langs;
    if (typeof window !== "undefined") return getLangs();
    try {
      const { cookies } = require("next/headers");
      return (cookies().get(LANG_KEY)?.value.split(",") ?? [DEFAULT_LANG]) as Array<Lang>;
    } catch {
      return [DEFAULT_LANG] as Array<Lang>;
    }
  })();

  const cache: Partial<LangCache> = (() => {
    if ((global as any).i18n == null) (global as any).i18n = {};
    return (global as any).i18n;
  })();

  const lang = ((key, arg) => {
    const [kind, k] = key.split(".");
    for (let i = 0, il = $langs.length; i < il; i++) {
      const lang = $langs[i];
      if (cache[lang] == null) cache[lang] = {};
      if (!(kind in cache[lang]!)) {
        try {
          cache[lang]![kind] = require(`@/i18n/${lang}/${kind}`)?.default;
        } catch (e) {
          cache[lang]![kind] = null;
          continue;
        }
      }
      const func = cache[lang]![kind]?.[k];
      if (func == null) continue;
      if (typeof func === "function") return func(arg as any);
      return func;
    }
    if (cache[DEFAULT_LANG] == null) cache[DEFAULT_LANG] = {};
    try {
      if (!(kind in cache[DEFAULT_LANG]!)) cache[DEFAULT_LANG]![kind] = require(`@/i18n/${DEFAULT_LANG}/${kind}`)?.default;
    } catch (e) {
      cache[DEFAULT_LANG]![kind] = null;
    }
    const func = cache[DEFAULT_LANG]![kind]?.[k];
    if (typeof func === "function") return func(arg as any);
    return func;
  }) as LangAccessor;
  lang.primary = $langs[0];
  return lang;
};
