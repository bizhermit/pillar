type OverwriteAttrs<T extends React.HTMLAttributes<React.ReactHTMLElement>, U> = Omit<T, keyof U> & U;
