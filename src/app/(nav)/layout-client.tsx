"use client";

import { signInPageUrl } from "@/auth/consts";
import { langFactory } from "@/i18n/factory";
import { Button } from "@/react/elements/button";
import { signOut } from "next-auth/react";

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
