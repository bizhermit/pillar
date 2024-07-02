"use client";

import { Button, ButtonIcon } from "@/react/elements/button";
import { sleep } from "@/utilities/sleep";
import { useRef } from "react";
import s from "./page.module.css";

export default function Home() {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div className={s.page}>
      root page

      <button disabled>button</button>
      <button>ボタン</button>
      <a
        // href="https://bizhermit.com"
        aria-disabled
        target="_blank"
      >
        リンク
      </a>
      <a
        href="https://bizhermit.com"
        role="button"
        target="_blank"
        aria-disabled
      >
        リンク
      </a>
      <Button
        ref={ref}
        onClick={() => {
          console.log(ref.current);
        }}
      >
        Reactボタン
      </Button>
      <Button
        onClick={async ({ unlock }) => {
          await sleep(3000);
          unlock();
        }}
      >
        <ButtonIcon>a</ButtonIcon>
      </Button>
    </div>
  );
}
