type PickPartial<T extends { [v: string | number | symbol]: any }, U extends string | number | symbol> = Omit<T, U> & Partial<Pick<T, U>>;
type PickRequired<T extends { [v: string | number | symbol]: any }, U extends string | number | symbol> = Omit<T, U> & Required<Pick<T, U>>;
type NonNull<T> = Exclude<T, null | undefined>;
type SwitchProps<T extends { [v: string | number | symbol]: any }, U extends { [v: string | number | symbol]: any }> = (
  (T & { [K in keyof U]?: null | undefined }) |
  (U & { [K in keyof T]?: null | undefined })
);
type EscapeNull<T, U = any> = T extends null | undefined ? U : (T extends any ? T : U);
type Readonlyable<T> = T | Readonly<T>;
