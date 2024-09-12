type PickPartial<T, U> = Omit<T, U> & Partial<Pick<T, U>>;

type Readonlyable<T> = T | Readonly<T>;
