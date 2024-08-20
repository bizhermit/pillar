import $Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes } from "react";
import { replaceDynamicPathname, type UrlPath } from "../../objects/url";

export type NextLinkOptions = {
  href?: UrlPath;
  params?: { [v: string | number | symbol]: any } | null | undefined;
  query?: { [v: string | number | symbol]: any } | null | undefined;
  disabled?: boolean;
  noDecoration?: boolean;
};

export type NextLinkProps = OverwriteProps<OverwriteAttrs<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">, LinkProps>, NextLinkOptions>;

export const Link = ({
  href,
  params,
  query,
  disabled,
  prefetch,
  noDecoration,
  ...props
}: NextLinkProps) => {
  const pathname = href ? replaceDynamicPathname(href, params) : "";
  return (
    <$Link
      {...props}
      prefetch={prefetch ?? false}
      aria-disabled={disabled}
      data-nodecoration={noDecoration}
      href={disabled ? "" : (query ? { pathname, query } : pathname)}
    />
  );
};

export default Link;
