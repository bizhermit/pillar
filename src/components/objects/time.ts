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

export class Time {

  protected time: number;

  constructor(time?: number | string | Date | Time | null) {
    this.time = 0;
    if (time == null) return this;
    if (typeof time === "number") {
      this.time = time;
      return this;
    }
    if (typeof time === "string") {
      if (/^\d$/.test(time)) {
        this.time = Number(time);
        if (isNaN(this.time)) this.time = 0;
        return this;
      }
      let ctx = time.match(/^(\+|\-|)(\d{2}|$)(\d{2}|$)(\d{2}|$)(\d{3}|$)/);
      if (!ctx) ctx = time.match(/^(\+|\-|)(\d+)?(?::|時|$)(\d+)?(?::|分|$)(\d+)?(?:.|秒|$)(\d+)?(?:.*|$)/);
      if (ctx) {
        this.time = (Number(ctx[2] ?? "0") * TimeRadix.H + Number(ctx[3] ?? "0") * TimeRadix.M + Number(ctx[4] ?? "0") * TimeRadix.S + Number(ctx[5] ?? "0")) * (ctx[1] === "-" ? -1 : 1);
      }
      return this;
    }
    if (typeof (time as any).time === "number") {
      this.time = (time as Time).time;
      return this;
    }
    this.time = ((time as Date).getTime() - (time as Date).getTimezoneOffset() * TimeRadix.M) % 86400000;
    return this;
  }

  public format(pattern = "-hh:mm:ss.SSS") {
    return pattern
      .replace("+-", this.time < 0 ? "-" : "+")
      .replace("-", this.time < 0 ? "-" : "")
      .replace("hh", `0${Math.abs(this.getHours())}`.slice(-2))
      .replace("h", String(Math.abs(this.getHours())))
      .replace("mm", `0${Math.abs(this.getMinutes())}`.slice(-2))
      .replace("m", String(Math.abs(this.getMinutes())))
      .replace("ss", `0${Math.abs(this.getSeconds())}`.slice(-2))
      .replace("s", String(Math.abs(this.getSeconds())))
      .replace("SSS", `00${Math.abs(this.getMilliseconds())}`.slice(-3))
      .replace("SS", `00${Math.abs(this.getMilliseconds())}`.slice(-3).slice(2))
      .replace("S", String(Math.abs(this.getMilliseconds())));
  }

  public getTime() {
    return this.time;
  }

  public getHours() {
    if (this.time < 0) return Math.ceil(this.time / TimeRadix.H);
    return Math.floor(this.time / TimeRadix.H);
  }

  public setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number) {
    this.time = Math.max(0, hours * TimeRadix.H + (minutes ?? this.getMinutes()) * TimeRadix.M + (seconds ?? this.getSeconds()) * TimeRadix.S + (milliseconds ?? this.getMilliseconds()));
    return this;
  }

  public getMinutes(include?: boolean) {
    if (include) {
      if (this.time < 0) return Math.ceil(this.time / TimeRadix.M);
      return Math.floor(this.time / TimeRadix.M);
    }
    if (this.time < 0) return Math.ceil(this.time / TimeRadix.M) % 60;
    return Math.floor(this.time / TimeRadix.M) % 60;
  }

  public setMinutes(minutes: number, seconds?: number, milliseconds?: number) {
    this.time = Math.max(0, this.getHours() * TimeRadix.H + minutes * TimeRadix.M + (seconds ?? this.getSeconds()) * TimeRadix.S + (milliseconds ?? this.getMilliseconds()));
    return this;
  }

  public getSeconds(include?: boolean) {
    if (include) {
      if (this.time < 0) return Math.ceil(this.time / TimeRadix.S);
      return Math.floor(this.time / TimeRadix.S);
    }
    if (this.time < 0) return Math.ceil(this.time / TimeRadix.S) % 60;
    return Math.floor(this.time / TimeRadix.S) % 60;
  }

  public setSeconds(seconds: number, milliseconds?: number) {
    this.time = Math.max(0, this.getMinutes(true) * TimeRadix.M + seconds * TimeRadix.S + (milliseconds ?? this.getMilliseconds()));
    return this;
  }

  public getMilliseconds(include?: boolean) {
    if (include) return this.time;
    return this.time % TimeRadix.S;
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

  export const adds = (...times: Array<Time | null |undefined>) => {
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
    return new Time(millisecond).format(pattern);
  };

}
