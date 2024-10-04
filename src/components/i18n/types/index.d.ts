type Lang = typeof import("../consts").LANGS[number];

interface I18N_Langs { }

type LangValue<A extends { [v: string]: any } | null = null> = A extends null ? ((() => string) | string) : (((arg: A) => string) | string);

type LangKinds = keyof I18N_Langs;
type LangKeys<K1 extends LangKinds> = keyof I18N_Langs[K1];

type LangValueArg<V extends LangValue<any>> = V extends string ? (null | undefined | { [v: string]: any }) : Parameters<V>[0];

type LangAccessor = <K1 extends LangKinds, K2 extends LangKeys<K1>>(key: `${K1}.${K2}`, arg?: LangValueArg<I18N_Langs[K1][K2]>) => string;

type LangCache = {
  [lang in Lang]: {
    [kind: string]: {
      [key: string]: ((arg?: { [v: string]: any }) => string) | string;
    } | null;
  };
};
