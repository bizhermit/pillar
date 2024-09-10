"use client";

import { signInPageUrl } from "@/auth/consts";
import { Button } from "@/react/elements/button";
import { signOut } from "next-auth/react";

export const SignOutButton = () => {
  return (
    <Button
      onClick={async () => {
        await signOut({
          callbackUrl: signInPageUrl,
        });
      }}
    >
      SignOut
    </Button>
  );
};
