type Lang = typeof import("./consts").LANGS[number];

interface I18N_Langs { }

type LangValue<A extends { [v: string]: any } | null = null> = A extends null ? ((() => string) | string) : (((arg: A) => string) | string);

type LangSection = keyof I18N_Langs;
type LangSectionKey<S extends LangSection> = keyof I18N_Langs[S];

type LangValueArg<V extends LangValue<any>> = V extends string ? (null | undefined | { [v: string]: any }) : Parameters<V>[0];

type LangStructKey = { [S in LangSection]: `${S}.${LangSectionKey<S>}` };
type LangKey = LangStructKey[keyof LangStructKey];

interface LangAccessor {
  <S extends LangSection, K extends LangSectionKey<S>>(key: `${S}.${K}` | LangKey, arg?: LangValueArg<I18N_Langs[S][K]>): string;
  primary: Lang;
}

type LangCache = {
  [lang in Lang]: {
    [section: string]: {
      [key: string]: ((arg?: { [v: string]: any }) => string) | string;
    } | null;
  };
};
