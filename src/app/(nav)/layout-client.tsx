"use client";

import { useLang } from "@/i18n/react-hook";
import { Button } from "@/react/elements/button";
import { signOut } from "next-auth/react";
import { signInPageUrl } from "~/auth/consts";

export const SignOutButton = () => {
  const lang = useLang();

  return (
    <Button
      title={lang("auth.signOutBtn")}
      onClick={async () => {
        await signOut({
          callbackUrl: signInPageUrl,
        });
      }}
    >
      {lang("auth.signOutBtn")}
    </Button>
  );
};
