"use client";

import { lang } from "@/i18n/react";
import { Button } from "@/react/elements/button";
import { signOut } from "next-auth/react";
import { signInPageUrl } from "~/auth/consts";

export const SignOutButton = () => {
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
