type OverwriteProps<T, U> = Omit<T, keyof U> & U;

type OverwriteAttrs<T extends React.HTMLAttributes<React.ReactHTMLElement>, U> = OverwriteProps<T, U>;
