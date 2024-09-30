// const

import { DateTime } from "./datetime";

// base

type ParsedDate<T extends string | number | Date | DateTime | null | undefined> = T extends null | undefined ? undefined : T extends DateTime ? Date : T extends Date ? Date : Date | undefined;

export const parseDate = <
  T extends string | number | Date | DateTime | null | undefined = string | number | Date | DateTime | null | undefined
>(date: T) => {
  if (date == null) return undefined as ParsedDate<T>;
  return new DateTime(date).getCloneDate() as ParsedDate<T>;
};

type FormattedString<T extends string | number | Date | DateTime | null | undefined> = T extends Date ? string : T extends undefined | null ? undefined : string | undefined;

export const formatDate = <
  T extends string | number | Date | DateTime | null | undefined = string | number | Date | DateTime | null | undefined
>(date?: T, pattern = "yyyy-MM-dd", week?: Parameters<DateTime["toString"]>["1"]) => {
  if (date == null) return undefined as FormattedString<T>;
  return new DateTime(date).toString(pattern, week);
};

// compare

export const equalDatetime = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return d1?.getTime() === d2?.getTime();
};

export const equalDay = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return d1?.getDate() === d2?.getDate();
};

export const equalMonth = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return d1?.getMonth() === d2?.getMonth();
};

export const equalYear = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return d1?.getFullYear() === d2?.getFullYear();
};

export const equalDate = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return equalDay(d1, d2) && equalMonth(d1, d2) && equalYear(d1, d2);
};

export const equalWeek = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return d1?.getDay() === d2?.getDay();
};

export const equalMonthDay = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return equalDay(d1, d2) && equalMonth(d1, d2);
};

export const equalYearMonth = (d1: Date | DateTime | null | undefined, d2: Date | DateTime | null | undefined) => {
  return equalMonth(d1, d2) && equalYear(d1, d2);
};

const dRad = 86400000;

export const isBeforeDatetime = (base: Date | DateTime, date: Date | DateTime) => {
  return base.getTime() > date.getTime();
};

export const isAfterDatetime = (base: Date | DateTime, date: Date | DateTime) => {
  return base.getTime() < date.getTime();
};

export const isBeforeDate = (base: Date | DateTime, beforeDate: Date | DateTime) => {
  return Math.floor(base.getTime() / dRad) > Math.floor(beforeDate.getTime() / dRad);
};

export const isAfterDate = (base: Date | DateTime, afterDate: Date | DateTime) => {
  return Math.floor(base.getTime() / dRad) < Math.floor(afterDate.getTime() / dRad);
};

export const getDaysDiff = (before: Date | DateTime | null | undefined, after: Date | DateTime | null | undefined) => {
  if (before == null || after == null) return 0;
  return Math.floor(after.getTime() / dRad) - Math.floor(before.getTime() / dRad);
};

export const validDateContext = (before: Date | DateTime | null | undefined, after: Date | DateTime | null | undefined) => {
  if (before == null || after == null) return true;
  return getDaysDiff(before, after) >= 0;
};

export const getAge = (birth: Date | DateTime, target: Date | DateTime) => {
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

export const splitDate = (d: string | Date | DateTime | null | undefined) => {
  const date = parseDate(d);
  if (date == null) return undefined;
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()] as const;
};

export const withoutTime = <
  T extends Date | DateTime | null | undefined = Date | DateTime | null | undefined
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
  return new DateTime(date).setFirstDateAtMonth().getCloneDate();
};

export const getLastDateAtMonth = (date = new Date()) => {
  return new DateTime(date).setLastDateAtMonth().getCloneDate();
};

export const getFirstDateAtYear = (date = new Date()) => {
  return new DateTime(date).setFirstDateAtYear().getCloneDate();
};

export const getLastDateAtYear = (date = new Date()) => {
  return new DateTime(date).setLastDateAtYear().getCloneDate();
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

export const getPrevMonthDate = (date = new Date()) => {
  return new DateTime(date).setPrevMonth().getCloneDate();
};

export const getNextMonthDate = (date = new Date()) => {
  return new DateTime(date).setNextMonth().getCloneDate();
};

export const getPrevYearDate = (date = new Date()) => {
  return new DateTime(date).setPrevYear().getCloneDate();
};

export const getNextYearDate = (date = new Date()) => {
  return new DateTime(date).setNextYear().getCloneDate();
};
