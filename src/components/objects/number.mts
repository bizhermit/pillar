// const

export namespace NumSign {

  /**
   * thousand digit separator
   */
  export const TDS = ",";

  /**
   * decimal point
   */
  export const DP = ".";

}

const tdsReg = new RegExp(NumSign.TDS, "g");

// base

type ParsedNumber<T extends string | number | null | undefined> = T extends null | undefined ? undefined : T extends number ? number : number | undefined;

export const parseNum = <
  T extends string | number | null | undefined = string | number | null | undefined
>(num: T) => {
  if (num == null || num === "") return undefined as ParsedNumber<T>;
  const t = typeof num;
  if (t === "number") return num as number as ParsedNumber<T>;
  if (t === "string") {
    const n = Number((num as string).replace(tdsReg, ""));
    if (!isNaN(n)) return n as ParsedNumber<T>;
  }
  return undefined as ParsedNumber<T>;
};

type FormattedString<T extends number | bigint | null | undefined> = T extends null | undefined ? undefined : string;

export const formatNum = <
  T extends number | bigint | null | undefined = number | bigint | null | undefined
>(num: T, opts?: { thou?: boolean; fpad?: number; }) => {
  if (num == null || (typeof num !== "number" && typeof num === "bigint")) return undefined as FormattedString<T>;
  let ret = num.toString(10);
  const s = ret.split(".");
  ret = opts?.thou !== false ? s[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${NumSign.TDS}`) : s[0];
  const f = s[1] || "";
  if (opts?.fpad) {
    ret += NumSign.DP + f;
    const c = opts.fpad - f.length;
    if (c > 0) ret += "0".repeat(c);
  } else if (f) {
    ret += NumSign.DP + f;
  }
  return ret as FormattedString<T>;
};

// float

export const round = (num: number, float = 0) => {
  if (num == null) return num;
  const denom = Math.pow(10, float);
  return Math.round(num * denom) / denom;
};

export const ceil = (num: number, float = 0) => {
  if (num == null) return num;
  const denom = Math.pow(10, float);
  return Math.ceil(num * denom) / denom;
};

export const floor = (num: number, float = 0) => {
  if (num == null) return num;
  const denom = Math.pow(10, float);
  return Math.floor(num * denom) / denom;
};

export const getFloatPosition = (num: number | null | undefined) => {
  if (num == null) return 0;
  const str = num.toString(10);
  if (str.indexOf(".") < 0) return 0;
  return str.length - 1 - str.lastIndexOf(".");
};

// calc

export const add = (num1: number | null | undefined, num2: number | null | undefined) => {
  if (num2 == null) return num1 ?? 0;
  if (num1 == null) return num2 ?? 0;
  const dotPos1 = getFloatPosition(num1), dotPos2 = getFloatPosition(num2);
  const maxDotPos = Math.max(dotPos1, dotPos2);
  return (Number((String(num1) + "0".repeat(maxDotPos - dotPos1)).replace(".", "")) + Number((String(num2) + "0".repeat(maxDotPos - dotPos2)).replace(".", ""))) / Math.pow(10, maxDotPos);
};

export const adds = (...nums: Array<number | null | undefined>) => {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0] ?? 0;
  let ret = nums[0] ?? 0;
  for (let i = 1, il = nums.length; i < il; i++) ret = add(ret, nums[i]);
  return ret;
};

export const minus = (num1: number | null | undefined, num2: number | null | undefined) => {
  if (num2 == null) return num1 ?? 0;
  if (num1 == null) return -num2 ?? 0;
  const dotPos1 = getFloatPosition(num1), dotPos2 = getFloatPosition(num2);
  const maxDotPos = Math.max(dotPos1, dotPos2);
  return (Number((String(num1) + "0".repeat(maxDotPos - dotPos1)).replace(".", "")) - Number((String(num2) + "0".repeat(maxDotPos - dotPos2)).replace(".", ""))) / Math.pow(10, maxDotPos);
};

export const average = (...nums: Array<number | null | undefined>) => {
  let sum = 0, denom = 0;
  nums.forEach(v => {
    if (v == null) return;
    sum = add(sum, v);
    denom++;
  });
  return sum / denom;
};
