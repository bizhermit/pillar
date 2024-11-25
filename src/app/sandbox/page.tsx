/* eslint-disable no-console */
"use client";

import { useLang } from "@/i18n/react-hook";
import { Button } from "@/react/elements/button";
import { getCookie } from "@/utilities/cookie";

const Page = () => {
  const lang = useLang();

  return (
    <div>
      <Button
        onClick={() => {
          console.log("--- delete lang ---");
          console.log(getCookie("lang"));
          lang.reset();
          console.log(getCookie("lang"));
        }}
      >
        clear lang
      </Button>
      <Button
        onClick={() => {
          lang.set(["ja"]);
        }}
      >
        ja
      </Button>
      <Button
        onClick={() => {
          lang.set(["en-US", "en"]);
        }}
      >
        en-US
      </Button>
      <Button
        onClick={() => {
          lang.set(["en", "en-US"]);
        }}
      >
        en
      </Button>
      <span>{lang("common.halloWorld")}</span>
      <br />
      <span>{lang("validation.required", { s: 1 })}</span>
    </div>
  );
};

export default Page;
