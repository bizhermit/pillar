// base

export const isEmpty = <T extends string = string>(str: T | null | undefined): str is null | undefined => {
  return str == null || str === "";
};

export const isNotEmpty = <T extends string = string>(str: T | null | undefined): str is Exclude<T, null | undefined> => {
  return str != null && str !== "";
};

export const strLength = (str: string | null | undefined) => {
  return str == null ? 0 : Array.from(str).length;
};

export const contains = (str: string | null | undefined, search: string) => {
  return isEmpty(str) ? false : str.indexOf(search) !== -1;
};

// convert

type ConvertedString<T extends string | null | undefined> = T extends null | undefined ? undefined : string;

export const toFullWidth = <
  T extends string | null | undefined = string | null | undefined
>(str: T) => {
  return str?.replace(/[A-Za-z0-9]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)) as ConvertedString<T>;
};

export const toHalfWidth = <
  T extends string | null | undefined = string | null | undefined
>(str: T) => {
  return str?.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) as ConvertedString<T>;
};

export const toHiragana = <
  T extends string | null | undefined = string | null | undefined
>(str: T) => {
  return str?.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)) as ConvertedString<T>;
};

export const toKatakana = <
  T extends string | null | undefined = string | null | undefined
>(str: T) => {
  return str?.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60)) as ConvertedString<T>;
};

// matcher

export const isHWNumeric = (str: string | null | undefined) => {
  return str != null && /^[0-9]+$/.test(str);
};

export const isFWNumeric = (str: string | null | undefined) => {
  return str != null && /^[０-９]+$/.test(str);
};

export const isNumeric = (str: string | null | undefined) => {
  return str != null && /^[0-9０-９]+$/.test(str);
};

export const isHWAlphabet = (str: string | null | undefined) => {
  return str != null && /^[a-zA-Z]+$/.test(str);
};

export const isFWAlphabet = (str: string | null | undefined) => {
  return str != null && /^[ａ-ｚＡ-Ｚ]+$/.test(str);
};

export const isAlphabet = (str: string | null | undefined) => {
  return str != null && /^[a-zA-Zａ-ｚＡ-Ｚ]+$/.test(str);
};

export const isHalfWidthSymbols = (str: string | null | undefined) => {
  return str != null && /^[!-/:-@¥[-`{-~]+$/.test(str);
};

export const isHWAlphanumeric = (str: string | null | undefined) => {
  return str != null && /^[a-zA-Z0-9]+$/.test(str);
};

export const isFWAlphanumeric = (str: string | null | undefined) => {
  return str != null && /^[ａ-ｚＡ-Ｚ０-９]+$/.test(str);
};

export const isAlphanumeric = (str: string | null | undefined) => {
  return str != null && /^[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９]+$/.test(str);
};

export const isHWAlphanumericAndSymbols = (str: string | null | undefined) => {
  return str != null && /^[a-zA-Z0-9!-/:-@¥[-`{-~]+$/.test(str);
};

export const isHWKatakana = (str: string | null | undefined) => {
  return str != null && /^[｡-ﾟ+]+$/.test(str);
};

export const isFWKatakana = (str: string | null | undefined) => {
  return str != null && /^[ァ-ヶー]+$/.test(str);
};

export const isKatakana = (str: string | null | undefined) => {
  return str != null && /^[｡-ﾟ+ァ-ヶー]+$/.test(str);
};

export const isHiragana = (str: string | null | undefined) => {
  return str != null && /^[ぁ-ゞー]+$/.test(str);
};

export const isHalfWidth = (str: string | null | undefined) => {
  return str != null && /^[\x20-\x7E]*$/.test(str);
};

export const isFullWidth = (str: string | null | undefined) => {
  return str != null && /^[^\x01-\x7E\uFF61-\uFF9F]*$/.test(str);
};

export const isInteger = (str: string | null | undefined) => {
  return str != null && /^[+-]?(0|[1-9]\d*)$/.test(str);
};

export const isPhoneNumber = (str: string | null | undefined) => {
  return str != null && (
    /^0\d-\d{4}-\d{4}$/.test(str)
    || /^0\d{3}-\d{2}-\d{4}$/.test(str)
    || /^0\d{2}-\d{3}-\d{4}$/.test(str)
    || /^0(7|8|9)0-\d{4}-\d{4}$/.test(str)
    || /^050-\d{4}-\d{4}$/.test(str)
    || /^\(0\d\)\d{4}-\d{4}$/.test(str)
    || /^\(0\d{3}\)\d{2}-\d{4}$/.test(str)
    || /^0120-\d{3}-\d{3}$/.test(str)
    || /^0120-\d{2}-\d{2}-\d{2}$/.test(str)
  );
};

export const isPostalCode = (str: string | null | undefined) => {
  return str != null && (/^[0-9]{3}-[0-9]{4}$/.test(str) || /^[0-9]{7}$/.test(str));
};

export const isMailAddress = (str: string | null | undefined) => {
  if (!str) return false;
  let quoted = false, escape = false;
  for (let i = 0, il = strLength(str); i < il; i++) {
    const c = str[i];
    if ("@" === c && !quoted) {
      // console.log("local:", str.slice(0, i));
      if (i < 1 || i > 64) {
        // console.log("[x] local len", i, str);
        return false;
      }
      if ("." === str[i - 1]) {
        // console.log("[x] local-part dot end", str);
        return false;
      }
      // domain
      const domain = str.slice(i + 1);
      // console.log("domain:", domain);
      if (strLength(domain) > 63) {
        // console.log("[x] domain len", strLength(domain), str);
        return false;
      }
      const ctx = domain.match(/^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\[((?:[0-9]{1,3}\.){3}[0-9]{1,3})\])|(?:((?:[0-9]{1,3}\.){3}[0-9]{1,3}))|(?:\[(?:IPv6:[a-fA-F0-9:]+\])))$/);
      if (!ctx) {
        // console.log("[x] un domain", str);
        return false;
      }
      const ipv4 = ctx[1] || ctx[2];
      if (ipv4) return isIpv4Address(ipv4);
      return true;
    }

    // local
    if (("\"" === c || "”" === c) && !escape) {
      if (quoted) {
        const next = str[i + 1];
        if ("." !== next && "@" !== next) {
          // console.log("[x] quote not end of part", `[${str[i - 1]}${c}${str[i + 1]}]`, i, str);
          return false;
        }
      } else {
        const prev = str[i - 1];
        if (prev && "." !== prev) {
          // console.log("[x] quote not start of part", `[${c}]`, i, str);
          return false;
        }
      }
      quoted = !quoted;
      continue;
    }

    if (quoted) {
      if (escape) {
        if (!/[\x01-\x09\x0b\x0c\x0e-\x7f\\ ]/.test(c)) {
          // console.log("[x] not allow quoted/escape char", `[${c}]`, str);
          return false;
        }
      } else {
        if ("\\" === c) {
          escape = true;
          continue;
        }
        if (!/[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f ]/.test(c)) {
          // console.log("[x] not allow quoted char", `[${c}]`, str);
          return false;
        }
      }
    } else {
      if (!/[.a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]/.test(c)) {
        // console.log("[x] not allow char", `[${c}]`, str);
        return false;
      }
      if ("." === c) {
        if (i === 0 || "." === str[i - 1]) {
          // console.log("[x] dot failed", str);
          return false;
        }
      }
    }
    escape = false;
  }

  // console.log("[x] no domain", str);
  return false;
};

export const isUrl = (str: string | null | undefined): str is `http${string}` => {
  return str != null && /^https?:\/\/[a-zA-Z0-9!-/:-@¥[-`{-~]+/.test(str);
};

export const isIpv4Address = (str: string | null | undefined) => {
  if (str == null) return false;
  const s = str.split(".");
  if (s.length !== 4) return false;
  for (const numStr of s) {
    if (!/^(0|[1-9]\d{0,2})/.test(numStr)) return false;
    const num = Number(numStr);
    if (num < 0 || num > 255) return false;
  }
  return true;
};

export const isIpv6Address = (str: string | null | undefined) => {
  return str != null && /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/.test(str);
};

export const isUuidV4 = (str: string | null | undefined) => {
  return str != null && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(str);
};

// generate

export const generateUuidV4 = () => {
  const c = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, il = c.length; i < il; i++) {
    switch (c[i]) {
      case "x":
        c[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case "y":
        c[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
      default: break;
    }
  }
  return c.join("");
};

