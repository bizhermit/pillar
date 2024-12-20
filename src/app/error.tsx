"use client";

import { Button } from "@/react/elements/button";
import { ReloadIcon } from "@/react/elements/icon";
import Link from "@/react/elements/link";
import css from "./error.module.scss";

const ErrorPage: ErrorFC = ({ error, reset }) => {
  // eslint-disable-next-line no-console
  console.log(error);

  return (
    <main className={css.main}>
      <h1>500&nbsp;|&nbsp;System&nbsp;Error</h1>
      <Button onClick={reset}>
        <ReloadIcon />
        <span>Retry</span>
      </Button>
      <Link href="/">Return Top</Link>
    </main>
  );
};

export default ErrorPage;
