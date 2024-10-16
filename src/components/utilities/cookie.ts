export const getCookies = () => {
  const ret: { [v: string]: string } = {};
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.warn(`faild to get cookie, not client side. [${name}]`);
    return ret;
  }
  document.cookie.split(/;\s?/g).forEach(c => {
    const [n, v] = c.split("=");
    ret[n] = v;
  });
  return ret;
};

export const getCookie = (name: string) => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.warn(`faild to get cookie, not client side. get: [${name}]`);
    return undefined;
  }
  const re = new RegExp(`^${encodeURIComponent(name)}=(.+)`);
  const v = document.cookie.split(/;\s?/g).find(c => c.match(re))?.split("=")[1];
  return v ? decodeURIComponent(v) : v;
};

type CookieOptions = {
  path?: PagePath;
  domain?: string;
  maxAge?: number;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
  samesite?: "Strict" | "Lax" | "None";
};

export const setCookie = (name: string, value: string, opts?: CookieOptions) => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.warn(`faild to get cookie, not client side. set: [${name}]`);
    return undefined;
  }
  const strs: Array<string> = [
    `SameSite=${opts?.samesite || "Lax"}`,
  ];
  if (!(opts && "path" in opts && opts.path == null)) strs.push(`Path=${opts?.path || "/"}`);
  if (opts?.domain) strs.push(`Domain=${opts.domain}`);
  if (opts?.expires) strs.push(`Expires=${opts.expires}`);
  if (opts?.maxAge != null) strs.push(`Max-Age=${opts.maxAge}`);
  if (opts?.secure) strs.push("Secure");
  if (opts?.httpOnly) strs.push("HttpOnly");
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${strs.join(";")}`;
};

export const deleteCookie = (name: string, opts?: Pick<CookieOptions, "path" | "domain">) => {
  setCookie(name, "", { ...opts, maxAge: 0 });
};
