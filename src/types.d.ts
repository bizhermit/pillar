type PickPartial<T extends { [v: string | number | symbol]: any }, U extends string | number | symbol> = Omit<T, U> & Partial<Pick<T, U>>;
type PickRequired<T extends { [v: string | number | symbol]: any }, U extends string | number | symbol> = Omit<T, U> & Required<Pick<T, U>>;
type NonNull<T> = Exclude<T, null | undefined>;
type SwitchProps<T extends { [v: string | number | symbol]: any }, U extends { [v: string | number | symbol]: any }> = (
  (T & { [K in keyof U]?: null | undefined }) |
  (U & { [K in keyof T]?: null | undefined })
);
type Readonlyable<T> = T | Readonly<T>;
