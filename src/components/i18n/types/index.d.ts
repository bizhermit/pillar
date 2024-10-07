type Lang = typeof import("../consts").LANGS[number];

interface I18N_Langs { }

type LangValue<A extends { [v: string]: any } | null = null> = A extends null ? ((() => string) | string) : (((arg: A) => string) | string);

type LangSection = keyof I18N_Langs;
type LangSectionKey<K1 extends LangSection> = keyof I18N_Langs[K1];

type LangValueArg<V extends LangValue<any>> = V extends string ? (null | undefined | { [v: string]: any }) : Parameters<V>[0];

type LangStructKey = { [S in LangSection]: `${S}.${LangSectionKey<S>}` };
type LangKey = LangStructKey[keyof LangStructKey];

type LangAccessor = <K1 extends LangSection, K2 extends LangSectionKey<K1>>(key: `${K1}.${K2}` | LangKey, arg?: LangValueArg<I18N_Langs[K1][K2]>) => string;

type LangCache = {
  [lang in Lang]: {
    [kind: string]: {
      [key: string]: ((arg?: { [v: string]: any }) => string) | string;
    } | null;
  };
};
