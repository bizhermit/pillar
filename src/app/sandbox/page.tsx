/* eslint-disable no-console */
"use client";

import { clearLang, setLang } from "@/i18n/client";
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
          clearLang();
          console.log(getCookie("lang"));
        }}
      >
        clear lang
      </Button>
      <Button
        onClick={() => {
          setLang("ja");
        }}
      >
        ja
      </Button>
      <Button
        onClick={() => {
          setLang("en-US");
        }}
      >
        en-US
      </Button>
      <Button
        onClick={() => {
          setLang("en");
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
