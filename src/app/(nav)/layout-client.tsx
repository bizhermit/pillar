"use client";

import { langFactory } from "@/i18n/next-factory";
import { Button } from "@/react/elements/button";
import { signOut } from "next-auth/react";
import { signInPageUrl } from "~/auth/consts";

export const SignOutButton = () => {
  const lang = langFactory();
  return (
    <Button
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
