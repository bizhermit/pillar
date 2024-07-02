"use client";

import { Button, ButtonIcon } from "@/react/elements/button";
import { sleep } from "@/utilities/sleep";
import s from "./page.module.css";

export default function Home() {
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
      <Button onClick={console.log}>
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
