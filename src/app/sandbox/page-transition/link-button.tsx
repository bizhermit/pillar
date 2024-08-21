"use client";

import { Button } from "@/react/elements/button";
import useRouter from "@/react/hooks/router";

type Props = {
  href: PagePath;
  params?: { [v: string]: any };
};

export const PageTransLinkButton = (props: Props) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        router.push(props.href, props.params);
      }}
    >
      {JSON.stringify(props.params ?? {})}
    </Button>
  );
};
