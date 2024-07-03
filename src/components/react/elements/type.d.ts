type OverwriteAttrs<E, T extends React.HTMLAttributes<E>, U> = Omit<T & {
  ref?: React.MutableRefObject<E | null>;
}, keyof U> & U;
