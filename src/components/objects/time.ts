// const

export namespace TimeRadix {

  /**
   * hour
   */
  export const H = 3600000;

  /**
   * minute
   */
  export const M = 60000;

  /**
   * second
   */
  export const S = 1000;

}

export type TimeUnit = "h" | "m" | "s" | "S";

export const parseMilliseconds = (time?: number | string | Date | Time | null | undefined, unit?: TimeUnit) => {
  if (time == null) return undefined;
  if (typeof time === "number") {
    switch (unit) {
      case "h":
        return time * TimeRadix.H;
      case "m":
        return time * TimeRadix.M;
      case "s":
        return time * TimeRadix.S;
      default:
        return time;
    }
  }
  if (time instanceof Date) return time.getTime();
  if (time instanceof Time) return time.getTime();
  if (/^[+-]?\d$/.test(time)) {
    const num = Number(time);
    if (isNaN(num)) return undefined;
    return num;
  }
  let ctx = time.match(/^(\+|\-|)(\d{2}|$)(\d{2}|$)(\d{2}|$)(\d{3}|$)/);
  if (!ctx) ctx = time.match(/^(\+|\-|)(\d+)?(?::|時|$)(\d+)?(?::|分|$)(\d+)?(?:.|秒|$)(\d+)?(?:.*|$)/);
  if (ctx) {
    return (Number(ctx[2] ?? "0") * TimeRadix.H + Number(ctx[3] ?? "0") * TimeRadix.M + Number(ctx[4] ?? "0") * TimeRadix.S + Number(ctx[5] ?? "0")) * (ctx[1] === "-" ? -1 : 1);
  }
  return undefined;
};

export const parseTimeAsUnit = (milliseconds: number | null | undefined, unit: TimeUnit = "m") => {
  if (milliseconds == null) return undefined;
  switch (unit) {
    case "h":
      return toHour(milliseconds);
    case "m":
      return toMinute(milliseconds, true);
    case "s":
      return toSecond(milliseconds, true);
    default:
      return milliseconds;
  }
};

const round = (t: number) => t < 0 ? "ceil" : "floor";

export const toHour = (milliseconds: number) => {
  return Math[round(milliseconds)](milliseconds / TimeRadix.H);
};

export const toMinute = (milliseconds: number, include?: boolean) => {
  const n = Math[round(milliseconds)](milliseconds / TimeRadix.M);
  return include ? n : n % 60;
};

export const toSecond = (milliseconds: number, include?: boolean) => {
  const n = Math[round(milliseconds)](milliseconds / TimeRadix.S);
  return include ? n : n % 60;
};

export const toMillisecond = (milliseconds: number, include?: boolean) => {
  return include ? milliseconds : milliseconds % TimeRadix.S;
};

type FormattedString<T extends number | string | Date | Time | null | undefined> = T extends Date ? string : T extends Time ? string : T extends undefined | null ? undefined : string | undefined;

export const formatTime = <
  T extends number | string | Date | Time | null | undefined = number | string | Date | Time | null | undefined
>(milliseconds: number, pattern = "-hh:mm") => {
  const t = parseMilliseconds(milliseconds);
  if (t == null) return undefined as FormattedString<T>;
  return pattern
    .replace("+-", t < 0 ? "-" : "+")
    .replace("-", t < 0 ? "-" : "")
    .replace("hh", `0${Math.abs(toHour(t))}`.slice(-2))
    .replace("h", String(Math.abs(toHour(t))))
    .replace("mmm", String(Math.abs(toMinute(t, true))))
    .replace("mm", `0${Math.abs(toMinute(t))}`.slice(-2))
    .replace("m", String(Math.abs(toMinute(t))))
    .replace("sss", String(Math.abs(toSecond(t, true))))
    .replace("ss", `0${Math.abs(toSecond(t))}`.slice(-2))
    .replace("s", String(Math.abs(toSecond(t))))
    .replace("SSS", `00${Math.abs(toMillisecond(t))}`.slice(-3))
    .replace("SS", `00${Math.abs(toMillisecond(t))}`.slice(-3).slice(2))
    .replace("S", String(Math.abs(toMillisecond(t)))) as FormattedString<T>;
};

export const getTimeUnit = (mode: "hm" | "hms" | "ms"): TimeUnit => {
  switch (mode) {
    case "hms":
    case "ms":
      return "s";
    default:
      return "m";
  }
};

export class Time {

  protected time: number;

  constructor(time?: number | string | Date | Time | null | undefined, unit?: TimeUnit) {
    this.time = parseMilliseconds(time, unit) ?? 0;
  }

  public format(pattern = "-hh:mm:ss.SSS") {
    return formatTime(this.time, pattern);
  }

  public getTime() {
    return this.time;
  }

  public getHours() {
    return toHour(this.time);
  }

  public setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number) {
    this.time = Math.max(0, hours * TimeRadix.H + (minutes ?? this.getMinutes()) * TimeRadix.M + (seconds ?? this.getSeconds()) * TimeRadix.S + (milliseconds ?? this.getMilliseconds()));
    return this;
  }

  public getMinutes(include?: boolean) {
    return toMinute(this.time, include);
  }

  public setMinutes(minutes: number, seconds?: number, milliseconds?: number) {
    this.time = Math.max(0, this.getHours() * TimeRadix.H + minutes * TimeRadix.M + (seconds ?? this.getSeconds()) * TimeRadix.S + (milliseconds ?? this.getMilliseconds()));
    return this;
  }

  public getSeconds(include?: boolean) {
    return toSecond(this.time, include);
  }

  public setSeconds(seconds: number, milliseconds?: number) {
    this.time = Math.max(0, this.getMinutes(true) * TimeRadix.M + seconds * TimeRadix.S + (milliseconds ?? this.getMilliseconds()));
    return this;
  }

  public getMilliseconds(include?: boolean) {
    return toMillisecond(this.time, include);
  }

  public setMilliseconds(milliseconds: number) {
    this.time = this.getSeconds(true) * TimeRadix.S + Math.max(0, milliseconds);
    return this;
  }

  public clear() {
    this.time = 0;
    return this;
  }

  public getCopy() {
    return new Time(this);
  }

  public addHours(add: number) {
    this.time = Math.max(0, this.time + add * TimeRadix.H);
    return this;
  }

  public addMinutes(add: number) {
    this.time = Math.max(0, this.time + add * TimeRadix.M);
    return this;
  }

  public addSeconds(add: number) {
    this.time = Math.max(0, this.time + add * TimeRadix.S);
    return this;
  }

  public addMilliseconds(add: number) {
    this.time = this.time + add;
    return this;
  }

  public isPlus() {
    return this.time >= 0;
  }

  public isMinus() {
    return this.time < 0;
  }

}

export namespace TimeUtils {

  export const max = (...times: Array<Time | null | undefined>) => {
    let max: number | undefined;
    times.forEach(time => {
      if (time == null) return;
      if (max == null) {
        max = time.getTime();
        return;
      }
      max = Math.max(max, time.getTime());
    });
    return new Time(max);
  };

  export const min = (...times: Array<Time | null | undefined>) => {
    let min: number | undefined = undefined;
    times.forEach(time => {
      if (time == null) return;
      if (min == null) {
        min = time.getTime();
        return;
      }
      min = Math.min(min, time.getTime());
    });
    return new Time(min);
  };

  export const average = (...times: Array<Time | null | undefined>) => {
    const time = TimeUtils.adds(...times);
    return new Time(Math.round(time.getTime() / Math.max(1, times.length)));
  };

  export const add = (time1: Time | null | undefined, time2: Time | null | undefined) => {
    if (time1 == null) return new Time(time2);
    if (time2 == null) return new Time(time1);
    return new Time(time1.getTime() + time2.getTime());
  };

  export const adds = (...times: Array<Time | null | undefined>) => {
    let t = 0;
    times.forEach(time => {
      if (time == null) return;
      t += time.getTime();
    });
    return new Time(t);
  };

  export const minus = (time1: Time | null | undefined, time2: Time | null | undefined) => {
    if (time1 == null) return new Time((time2?.getTime() ?? 0) * -1);
    if (time2 == null) return new Time(time1.getTime());
    return new Time(time1.getTime() - time2.getTime());
  };

  export const validContext = (before: Time | null | undefined, after: Time | null | undefined) => {
    if (before == null || after == null) return true;
    return after.getTime() - before.getTime() >= 0;
  };

  export const convertMillisecondsToUnit = (milliseconds: number | null | undefined, returnUnit: "hour" | "minute" | "second" | "millisecond", mode: "floor" | "ceil" | "round" = "round") => {
    if (milliseconds == null) return undefined;
    const impl = (denom: number) => {
      if (mode === "ceil") {
        if (milliseconds < 0) Math.floor(milliseconds / denom);
        return Math.ceil(milliseconds / denom);
      }
      if (mode === "floor") {
        if (milliseconds < 0) Math.ceil(milliseconds / denom);
        return Math.floor(milliseconds / denom);
      }
      return Math.round(milliseconds / denom);
    };
    if (returnUnit === "hour") return impl(TimeRadix.H);
    if (returnUnit === "minute") return impl(TimeRadix.M);
    if (returnUnit === "second") return impl(TimeRadix.S);
    return milliseconds;
  };

  export const convertUnitToMilliseconds = (value: number | null | undefined, argUnit: "hour" | "minute" | "second" | "millisecond") => {
    if (value == null) return undefined;
    if (argUnit === "hour") return value * TimeRadix.H;
    if (argUnit === "minute") return value * TimeRadix.M;
    if (argUnit === "second") return value * TimeRadix.S;
    return value;
  };

  export const format = (millisecond: number, pattern?: string) => {
    return formatTime(millisecond, pattern);
  };

}
