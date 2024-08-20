"use client";

import { getDynamicPathname } from "@/objects/url";
import { Button } from "@/react/elements/button";
import useRouter from "@/react/hooks/router";

type Props = {
  href: PagePath;
  params?: { [v: string]: any };
};

export const LinkButton = (props: Props) => {
  const url = getDynamicPathname(props.href, props.params);
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        router.push(props.href, props.params);
      }}
    >
      {url}
    </Button>
  );
};
