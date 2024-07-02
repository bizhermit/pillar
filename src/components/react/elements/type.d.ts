type OverwriteAttrs<T extends React.HTMLAttributes<any>, U> = Omit<T, keyof U> & U;
