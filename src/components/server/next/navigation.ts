import { getRedirectError as _getRedirectError } from "next/dist/client/components/redirect";
import { redirect as _redirect, RedirectType } from "next/navigation";
import { DynamicUrlOptions, getDynamicPathname } from "../../objects/url";

export const redirect: ((pathname: PagePath, params?: { [v: string | number]: any }, opts?: DynamicUrlOptions & { type?: keyof typeof RedirectType }) => never) = (pn, p?, o?) => {
  _redirect(getDynamicPathname(pn, p, o), o?.type ? RedirectType[o.type] : undefined);
};

export const getRedirectError = (pathname: PagePath, params?: { [v: string | number]: any }, opts?: DynamicUrlOptions & { type?: keyof typeof RedirectType; statusCode?: Parameters<typeof _getRedirectError>[2]; }) => {
  return _getRedirectError(getDynamicPathname(pathname, params, opts), RedirectType[opts?.type || "replace"], opts?.statusCode);
};
