"use client";

import { clearLang, setLang } from "@/i18n/client";
import { Button } from "@/react/elements/button";

export const LnagSwitch = () => {
  return (
    <div>
      <Button
        onClick={() => {
          clearLang();
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
