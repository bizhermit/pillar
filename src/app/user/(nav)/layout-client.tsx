"use client";

import { Button } from "@/react/elements/button";
import { signOut } from "../../../auth";

export const SignOutButton = () => {
  return (
    <Button
      onClick={async () => {
        signOut();
      }}
    >
      SignOut
    </Button>
  );
};
