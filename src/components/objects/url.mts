import queryString from "querystring";
import { convertFormDataToStruct } from "./form-data.mjs";
import { getValue } from "./struct.mjs";

type UrlPath = `http://${string}` | `https://${string}` | `tel:${string}` | `mailto:${string}`;

const replace = <T extends UrlPath>(href: T, getValue: (key: string) => any): T => {
  if (href == null) return href;
  return href.replace(/\[\[?([^\]]*)\]?\]/g, seg => {
    const r = seg.match(/^\[{1,2}(\.{3})?([^\]]*)\]{1,2}$/)!;
    const v = getValue(r[2]);
    if (Array.isArray(v)) {
      if (r[1]) return v.map(c => `${c}`).join("/");
      return v[0];
    }
    return v ?? "";
  }) as T;
};

export const replaceDynamicPathname = <T extends UrlPath>(href: T, params: { [v: string | number | symbol]: any } | null | undefined): T => {
  if (href == null) return href;
  return replace(href, key => getValue(params, key));
};

export type DynamicUrlOptions = {
  appendQuery?: boolean;
  leaveDynamicKey?: boolean;
  useOriginParams?: boolean;
  queryArrayIndex?: boolean;
};

export const getDynamicPathnameContext = <
  T extends { [v: string | number | symbol]: any } | FormData | null | undefined,
  U extends UrlPath = UrlPath
>(pathname: U, params?: T, opts?: DynamicUrlOptions): { pathname: U; data: T } => {
  const data: { [v: string | number | symbol]: any } | FormData = (opts?.useOriginParams ? params : (() => {
    if (params == null) return {};
    if (params instanceof FormData) {
      const fd = new FormData();
      params.forEach((v, k) => fd.append(k, v));
      return fd;
    }
    return { ...params };
  })()) ?? {};

  const getDataValue = (key: string) => {
    if (data instanceof FormData) {
      const v = data.get(key);
      if (opts?.leaveDynamicKey !== true) data.delete(key);
      return v;
    }
    const v = getValue(data, key);
    if (opts?.leaveDynamicKey !== true) delete data[key];
    return v;
  };

  let retPathname: string = replace(pathname, getDataValue);

  if (opts?.appendQuery) {
    const q = queryString.stringify((() => {
      if (data == null) return {};
      const sd = data instanceof FormData ? convertFormDataToStruct(data) : data;
      const d: { [v: string]: any } = {};
      Object.keys(sd).forEach(key => {
        const v = sd[key];
        if (v == null) return;
        if (opts.queryArrayIndex && Array.isArray(v)) {
          v.forEach((val, i) => {
            if (val == null) return;
            d[`${key}[${i}]`] = val;
          });
          return;
        }
        d[key] = v;
      });
      return d;
    })());
    if (q) retPathname += `?${q}`;
  }

  return { pathname: retPathname as U, data: data as T };
};

export const getDynamicPathname = <
  U extends UrlPath = UrlPath
>(pathname: U, params?: { [v: string | number | symbol]: any }, opts?: DynamicUrlOptions) => {
  return getDynamicPathnameContext(pathname, params, opts).pathname;
};
