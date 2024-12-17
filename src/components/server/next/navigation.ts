import { getRedirectError as _getRedirectError } from "next/dist/client/components/redirect";
import { redirect as _redirect, RedirectType } from "next/navigation";
import { DynamicUrlOptions, getDynamicPathname } from "../../objects/url";

type Params = { [v: string | number | symbol]: any };

type Options = DynamicUrlOptions & {
  type?: keyof typeof RedirectType;
};

type StatusCodeOption = {
  statusCode?: Parameters<typeof _getRedirectError>[2];
};

export const redirect: ((pathname: PagePath, params?: Params, opts?: Options) => never) = (pn, p?, o?) => {
  _redirect(
    getDynamicPathname(pn, p, o),
    o?.type ? RedirectType[o.type] : undefined
  );
};

export const getRedirectError = (pathname: PagePath, params?: Params, opts?: Options & StatusCodeOption) => {
  return _getRedirectError(
    getDynamicPathname(pathname, params, opts),
    RedirectType[opts?.type || "replace"],
    opts?.statusCode
  );
};
