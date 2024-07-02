type OverwriteAttrs<E, T extends React.HTMLAttributes<E>, U> = Omit<T, keyof U> & U & {
  ref?: React.MutableRefObject<E | null>;
};
