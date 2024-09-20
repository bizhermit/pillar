// const

import { DateTime } from "./datetime";

export namespace Month {

  export const en = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

  export const en_s = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."] as const;

  export const ja = ["１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"] as const;

}

export namespace Week {

  export const ja_s = ["日", "月", "火", "水", "木", "金", "土"] as const;

  export const en_s = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

}

// base

type ParsedDate<T extends string | number | Date | DateTime | null | undefined> = T extends null | undefined ? undefined : T extends DateTime ? Date : T extends Date ? Date : Date | undefined;

export const parseDate = <
  T extends string | number | Date | DateTime | null | undefined = string | number | Date | null | undefined
>(date: T) => {
  if (date == null) return undefined as ParsedDate<T>;
  if (typeof date === "string") {
    let ctx = date.match(/^(\d{4})(\d{2}|$)(\d{2}|$)(\d{2}|$)(\d{2}|$)(\d{2}|$)(\d{3}|$)/);
    if (!ctx) ctx = date.match(/^(\d+)?(?:-|\/|年|$)(\d+)?(?:-|\/|月|$)(\d+)?(?:\s*|日\s*|T|$)(\d+)?(?::|時|$)(\d+)?(?::|分|$)(\d+)?(?:.|秒|$)(\d+)?(?:.*|$)/);
    if (ctx) return new Date(Number(ctx[1]), Number(ctx[2] || 1) - 1, Number(ctx[3] || 1), Number(ctx[4] || 0), Number(ctx[5] || 0), Number([ctx[6] || 0]), Number(ctx[7] || 0)) as ParsedDate<T>;
    ctx = date.match(/^(?:\w+)?\s(\w+)?\s(\d+)?\s(\d+)?\s(\d+)?:(\d+)?:(\d+)?/);
    if (ctx) {
      const re = new RegExp(`^${ctx[1]}`, "i");
      return new Date(Number(ctx[3]), Math.max(Month.en.findIndex(v => re.exec(v)), 0), Number(ctx[2]), Number(ctx[4]), Number(ctx[5]), Number(ctx[6])) as ParsedDate<T>;
    }
    return undefined as ParsedDate<T>;
  }
  if (typeof date === "number") return new Date(date) as ParsedDate<T>;
  return new Date(date.getTime()) as ParsedDate<T>;
};

type FormattedString<T extends string | number | Date | null | undefined> = T extends Date ? string : T extends undefined | null ? undefined : string | undefined;

export const formatDate = <
  T extends string | number | Date | null | undefined = string | number | Date | null | undefined
>(date?: T, pattern = "yyyy-MM-dd", week?: Array<string>) => {
  const d = parseDate(date);
  if (d == null) return undefined as FormattedString<T>;
  return pattern
    .replace(/yyyy/g, String(d.getFullYear()))
    .replace(/yy/g, `00${d.getFullYear()}`.slice(-2))
    .replace(/~M/g, ` ${d.getMonth() + 1}`.slice(-2))
    .replace(/MM/g, `0${d.getMonth() + 1}`.slice(-2))
    .replace(/M/g, String(d.getMonth() + 1))
    .replace(/~d/g, ` ${d.getDate()}`.slice(-2))
    .replace(/dd/g, `0${d.getDate()}`.slice(-2))
    .replace(/d/g, String(d.getDate()))
    .replace(/~h/g, ` ${d.getHours()}`.slice(-2))
    .replace(/hh/g, `0${d.getHours()}`.slice(-2))
    .replace(/h/g, String(d.getHours()))
    .replace(/~m/g, ` ${d.getMinutes()}`.slice(-2))
    .replace(/mm/g, `0${d.getMinutes()}`.slice(-2))
    .replace(/m/g, String(d.getMinutes()))
    .replace(/~s/g, ` ${d.getSeconds()}`.slice(-2))
    .replace(/ss/g, `0${d.getSeconds()}`.slice(-2))
    .replace(/s/g, String(d.getSeconds()))
    .replace(/SSS/g, `00${d.getMilliseconds()}`.slice(-3))
    .replace(/SS/g, `00${d.getMilliseconds()}`.slice(-3).slice(2))
    .replace(/S/g, String(d.getMilliseconds()))
    .replace(/w/g, (week ?? Week.ja_s)[d.getDay()]) as FormattedString<T>;
};

// compare

export const equalDatetime = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return d1?.getTime() === d2?.getTime();
};

export const equalDay = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return d1?.getDate() === d2?.getDate();
};

export const equalMonth = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return d1?.getMonth() === d2?.getMonth();
};

export const equalYear = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return d1?.getFullYear() === d2?.getFullYear();
};

export const equalDate = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return equalDay(d1, d2) && equalMonth(d1, d2) && equalYear(d1, d2);
};

export const equalWeek = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return d1?.getDay() === d2?.getDay();
};

export const equalMonthDay = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return equalDay(d1, d2) && equalMonth(d1, d2);
};

export const equalYearMonth = (d1: Date | null | undefined, d2: Date | null | undefined) => {
  return equalMonth(d1, d2) && equalYear(d1, d2);
};

const dRad = 86400000;

export const isBeforeDatetime = (base: Date, date: Date) => {
  return base.getTime() > date.getTime();
};

export const isAfterDatetime = (base: Date, date: Date) => {
  return base.getTime() < date.getTime();
};

export const isBeforeDate = (base: Date, beforeDate: Date) => {
  return Math.floor(base.getTime() / dRad) > Math.floor(beforeDate.getTime() / dRad);
};

export const isAfterDate = (base: Date, afterDate: Date) => {
  return Math.floor(base.getTime() / dRad) < Math.floor(afterDate.getTime() / dRad);
};

export const getDaysDiff = (before: Date | null | undefined, after: Date | null | undefined) => {
  if (before == null || after == null) return 0;
  return Math.floor(after.getTime() / dRad) - Math.floor(before.getTime() / dRad);
};

export const validDateContext = (before: Date | null | undefined, after: Date | null | undefined) => {
  if (before == null || after == null) return true;
  return getDaysDiff(before, after) >= 0;
};

export const getAge = (birth: Date, target: Date) => {
  let age = target.getFullYear() - birth.getFullYear();
  let monthDiff = target.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// convert

export const joinSplittedDate = (y: string | undefined, m: string | undefined, d: string | undefined) => {
  if (y == null || y === "" || m == null || y === "" || d == null || d === "") return undefined;
  return `${y}-${m}-${d}`;
};

export const splitDate = (d: string | Date | null | undefined) => {
  const date = parseDate(d);
  if (date == null) return undefined;
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()] as const;
};

export const withoutTime = <
  T extends Date | null | undefined = Date | null | undefined
>(date: T): T => {
  if (date == null) return date;
  date.setHours(0, 0, 0, 0);
  return date;
};

// calc

export const addDay = (date: Date, num: number) => {
  date.setDate(date.getDate() + num);
  return date;
};

export const addMonth = (date: Date, num: number) => {
  date.setMonth(date.getMonth() + num);
  return date;
};

export const addYear = (date: Date, num: number) => {
  date.setFullYear(date.getFullYear() + num);
  return date;
};

export const getFirstDateAtMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getLastDateAtMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getFirstDateAtYear = (date = new Date()) => {
  return new Date(date.getFullYear(), 0, 1);
};

export const getLastDateAtYear = (date = new Date()) => {
  return new Date(date.getFullYear(), 11, 31);
};

export const getPrevDate = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
};

export const getNextDate = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
};

export const getPrevWeekDate = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
};

export const getNextWeekDate = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
};

export const getPrevMonthDate = (date = new Date(), fixedYM = false) => {
  const d = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
  if (fixedYM === true && d.getDate() !== date.getDate()) d.setDate(0);
  return d;
};

export const getNextMonthDate = (date = new Date(), fixedYM = false) => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
  if (fixedYM === true && d.getDate() !== date.getDate()) d.setDate(0);
  return d;
};

export const getPrevYearDate = (date = new Date(), fixedYM = false) => {
  const d = new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
  if (fixedYM === true && d.getDate() !== date.getDate()) d.setDate(0);
  return d;
};

export const getNextYearDate = (date = new Date(), fixedYM = false) => {
  const d = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
  if (fixedYM === true && d.getDate() !== date.getDate()) d.setDate(0);
  return d;
};
