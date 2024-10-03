import { DEFAULT_LANG, LANGS } from "./consts";

export const analyzeHeaderAcceptLang = (str: string | null | undefined) => {
  return str?.split(",")
    .map((lang) => {
      const [l, q] = lang.split(";");
      return {
        l: l.trim() as LANG,
        q: (() => {
          if (!q) return 1;
          const num = Number(q.trim().match(/q\=(.+)/)?.[1]);
          if (num == null || isNaN(num)) return 0;
          return num;
        })(),
      };
    })
    .sort((l1, l2) => l2.q - l1.q)
    .filter(({ l }) => LANGS.find(L => L === l))
    .map(({ l }) => l)
    .join(",") || DEFAULT_LANG;
};
