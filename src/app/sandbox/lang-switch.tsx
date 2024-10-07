"use client";

import { clearLang, setLang } from "@/i18n/client";
import { Button } from "@/react/elements/button";
import { getCookie } from "@/utilities/cookie";

export const LnagSwitch = () => {
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
    </div>
  );
};
