type PickPartial<T, U> = Omit<T, U> & Partial<Pick<T, U>>;
