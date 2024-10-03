type LANG = typeof import("./consts").LANGS[number];

type LangCache = {
  [lang in LANG]: {
    [kind: string]: {
      [key: string]: (arg?: { [v: string]: any }) => string;
    } | null;
  };
};
