import { DEFAULT_LANG } from "./consts";

type Cache = { [v: string | number | symbol]: any };
const isDev = (process.env.NODE_ENV || "").startsWith("dev");

const importFile = (l: Lang, s: LangSection) => require(`src/i18n/${l}/${s}`)?.default;

const D_L = DEFAULT_LANG; // NOTE: ここで代入定義しないと、フォールバックでデフォルト参照時に`DEFAULT_LANG is not defined`となる

const getCache = isDev ?
  ((cache?: Cache) => {
    if (cache) return cache;
    if ((global as any).i18n == null) (global as any).i18n = {};
    return (global as any).i18n = {}; // NOTE: 開発時はサーバー側でのキャッシュを無効化する。（サーバー再起動は必要ないが、クライアントのホットリロードは失敗するのでリロードは必要）。クライアント側のキャッシュはリロードすれば消えるため特に何もしない。
  }) :
  ((cache?: Cache) => {
    if (cache) return cache;
    if ((global as any).i18n == null) (global as any).i18n = {};
    return (global as any).i18n;
  });

export const langFactoryCore = (langs: Array<Lang>, cache?: Cache) => {
  const $cache: Partial<LangCache> = getCache(cache);

  const lang = ((key, arg) => {
    const [s, k] = key.split(/\./) as [LangSection, LangSectionKey<LangSection>];
    for (let i = 0, il = langs.length; i < il; i++) {
      const l = langs[i];
      if ($cache[l] == null) $cache[l] = {};
      if (!(s in $cache[l]!)) {
        try {
          $cache[l]![s] = importFile(l, s);
        } catch (e) {
          $cache[l]![s] = null;
          continue;
        }
      }
      const func = $cache[l]![s]?.[k];
      if (func == null) continue;
      if (typeof func === "function") return func(arg as any);
      return func;
    }
    if ($cache[D_L] == null) $cache[D_L] = {};
    try {
      if (!(s in $cache[D_L]!)) $cache[D_L]![s] = importFile(D_L, s);
    } catch (e) {
      $cache[D_L]![s] = null;
    }
    const func = $cache[D_L]![s]?.[k];
    if (typeof func === "function") return func(arg as any);
    return func;
  }) as LangAccessor;
  lang.primary = langs[0];
  return lang;
};
