
export type TimeZone =
  | "Z"
  | "UTC"
  | "Asia/Tokyo"
  | "America/Los_Angeles"
  | "America/Argentina/Buenos_Aires"
  | `+${number}:${number}`
  | `+${number}${number}`
  | `-${number}:${number}`
  | `-${number}${number}`;

export const parseTimezoneOffset = (tz: TimeZone) => {
  const a = tz.match(/^(\+|-)(\d{1,2})[:]?(\d{1,2})/);
  if (a) return (Number(a[2] || 0) * 60 + Number(a[3] || 0)) * (a[1] === "-" ? 1 : -1);
  switch (tz) {
    case "Z":
    case "UTC": return 0;
    case "Asia/Tokyo": return -540;
    case "America/Los_Angeles": return 480;
    case "America/Argentina/Buenos_Aires": return 180;
    default:
      throw new Error(`not supported timezone: [${tz}]`);
  }
};

export const parseOffsetString = (offset: number) => {
  if (offset === 0) return "Z";
  const o = Math.abs(offset);
  const h = Math.floor(o / 60);
  return `${offset > 0 ? "-" : "+"}${`00${h}`.slice(-2)}:${`00${o - (h * 60)}`.slice(-2)}`;
};

export namespace Month {

  export const en = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

  export const en_s = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."] as const;

  export const ja = ["１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"] as const;

}

export namespace Week {

  export const ja_s = ["日", "月", "火", "水", "木", "金", "土"] as const;

  export const en_s = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

}

type WeekArray = [string, string, string, string, string, string, string];

const env_tz = process.env.TZ?.trim() as TimeZone | undefined;
const env_offset = env_tz ? parseTimezoneOffset(env_tz) : new Date().getTimezoneOffset();

export class DateTime {

  private date: Date;
  private offset: number;

  constructor(datetime?: string | number | Date | DateTime | null | undefined, timezone?: number | TimeZone) {
    this.date = new Date();
    this.offset = this.date.getTimezoneOffset();
    this.set(datetime, timezone ?? env_offset);
  }

  public set(datetime: string | number | Date | DateTime | null | undefined, timezone?: number | TimeZone) {
    const offset = (() => {
      if (timezone == null) return this.offset;
      if (typeof timezone === "number") return timezone;
      return parseTimezoneOffset(timezone);
    })();

    if (datetime == null) {
      this.date.setTime(Date.now() - (offset - this.date.getTimezoneOffset()) * 60000);
    } else if (datetime instanceof DateTime) {
      this.date.setTime(datetime.getTime() - (- datetime.getTimezoneOffset()) * 60000);
    } else if (datetime instanceof Date) {
      this.date.setTime(datetime.getTime() - (offset - datetime.getTimezoneOffset()) * 60000);
    } else {
      if (typeof datetime === "number") {
        this.date.setTime(datetime + this.date.getTimezoneOffset() * 60000);
      } else {
        const a = datetime.match(/^(\d{1,4})[-|\/|年]?(\d{1,2}|$)[-|\/|月]?(\d{1,2}|$)[日]?[\s|T]?(\d{1,2}|$)[:]?(\d{1,2}|$)[:]?(\d{1,2}|$)[.]?(\d{0,3}|$)?(.*)/);
        if (a) {
          const tz = a[8];
          const d = new Date(
            Number(a[1]),
            Number(a[2] || 1) - 1,
            Number(a[3] || 1),
            Number(a[4] || 0),
            Number(a[5] || 0),
            Number(a[6] || 0),
            Number(a[7] || 0)
          );
          if (!tz) {
            this.date.setTime(d.getTime());
          } else {
            this.date.setTime(d.getTime() - (offset - parseTimezoneOffset(tz as TimeZone)) * 60000);
          }
        } else {

        }
      }
    }
    this.offset = offset;
    return this;
  }

  public setDateTime({ date, time, timeUnit, timezone }: {
    date: string | Date | number;
    time?: number | null | undefined;
    timeUnit?: "h" | "m" | "s" | "S";
    timezone?: TimeZone | number;
  }) {
    this.set(date);
    this.removeTime();
    if (time != null) {
      switch (timeUnit) {
        case "S":
          this.setMilliseconds(time);
          break;
        case "s":
          this.setSeconds(time);
          break;
        case "m":
          this.setMinutes(time);
          break;
        case "h":
          this.setHours(time);
          break;
        default:
          this.setMinutes(time);
          break;
      }
    }
    if (timezone != null) {
      this.offset = typeof timezone === "number" ? timezone : parseTimezoneOffset(timezone);
    }
    return this;
  }

  public getCloneDate() {
    return new Date(this.date.getTime());
  }

  public static timezoneOffset() {
    return new Date().getTimezoneOffset();
  }

  public static timezone() {
    return parseOffsetString(DateTime.timezoneOffset());
  }

  public getTimezoneOffset() {
    return this.offset;
  }

  public setTimezoneOffset(offset: number) {
    if (this.offset === offset) return this;
    const diff = (this.offset - offset) * 60000;
    this.offset = offset;
    this.date.setTime(this.date.getTime() + diff);
    return this;
  }

  public getTimezone() {
    return parseOffsetString(this.offset);
  }

  public setTimezone(tz: TimeZone) {
    return this.setTimezoneOffset(parseTimezoneOffset(tz));
  }

  public replaceTimezoneOffset(offset: number) {
    this.offset = offset;
    return this;
  }

  public replaceTimezone(tz: TimeZone) {
    return this.replaceTimezoneOffset(parseTimezoneOffset(tz));
  }

  public setDefaultTimezone() {
    this.setTimezoneOffset(this.date.getTimezoneOffset());
  }

  public getTime() {
    return this.date.getTime();
  }

  public getUTCTime() {
    return this.evacuateOffset(() => this.getTime());
  }

  public toString(pattern: string = "yyyy-MM-ddThh:mm:ss.SSSt", week?: WeekArray) {
    return pattern
      .replace(/yyyy/g, String(this.date.getFullYear()))
      .replace(/yy/g, `00${this.date.getFullYear()}`.slice(-2))
      .replace(/~M/g, ` ${this.date.getMonth() + 1}`.slice(-2))
      .replace(/MM/g, `0${this.date.getMonth() + 1}`.slice(-2))
      .replace(/M/g, String(this.date.getMonth() + 1))
      .replace(/~d/g, ` ${this.date.getDate()}`.slice(-2))
      .replace(/dd/g, `0${this.date.getDate()}`.slice(-2))
      .replace(/d/g, String(this.date.getDate()))
      .replace(/~h/g, ` ${this.date.getHours()}`.slice(-2))
      .replace(/hh/g, `0${this.date.getHours()}`.slice(-2))
      .replace(/h/g, String(this.date.getHours()))
      .replace(/~m/g, ` ${this.date.getMinutes()}`.slice(-2))
      .replace(/mm/g, `0${this.date.getMinutes()}`.slice(-2))
      .replace(/m/g, String(this.date.getMinutes()))
      .replace(/~s/g, ` ${this.date.getSeconds()}`.slice(-2))
      .replace(/ss/g, `0${this.date.getSeconds()}`.slice(-2))
      .replace(/s/g, String(this.date.getSeconds()))
      .replace(/SSS/g, `00${this.date.getMilliseconds()}`.slice(-3))
      .replace(/SS/g, `00${this.date.getMilliseconds()}`.slice(-3).slice(2))
      .replace(/S/g, String(this.date.getMilliseconds()))
      .replace(/t/g, this.getTimezone())
      .replace(/w/g, (week ?? Week.ja_s)[this.date.getDay()]);
  }

  private evacuateOffset<T>(func: () => T) {
    const o = this.offset;
    this.setTimezoneOffset(0);
    const r = func();
    this.setTimezoneOffset(o);
    return r;
  }

  public toISOString() {
    return this.evacuateOffset(() => this.toString());
  }

  public toDateString() {
    return this.toString("yyyy-MM-dd");
  }

  public toTimeString() {
    return this.toString("hh:mm:ss");
  }

  public toJSON() {
    return this.toISOString();
  }

  public setCurrent(removeTime = false) {
    this.set(null);
    if (removeTime) this.removeTime();
    return this;
  }

  public getFullYear() {
    return this.date.getFullYear();
  }

  public setFullYear(year: number, month?: number, date?: number) {
    this.date.setFullYear(year, month ?? this.getMonth(), date ?? this.getDate());
    return this;
  }

  public getUTCFullYear() {
    return this.evacuateOffset(() => this.getFullYear());
  }

  public setUTCFullYear(year: number, month?: number, date?: number) {
    return this.evacuateOffset(() => this.setFullYear(year, month, date));
  }

  public getMonth() {
    return this.date.getMonth();
  }

  public setMonth(month: number, date?: number) {
    this.date.setMonth(month, date ?? this.getDate());
    return this;
  }

  public getUTCMonth() {
    return this.evacuateOffset(() => this.getMonth());
  }

  public setUTCMonth(month: number, date?: number) {
    return this.evacuateOffset(() => this.setMonth(month, date));
  }

  public getDate() {
    return this.date.getDate();
  }

  public setDate(date: number) {
    this.date.setDate(date);
    return this;
  }

  public getUTCDate() {
    return this.evacuateOffset(() => this.getDate());
  }

  public setUTCDate(date: number) {
    return this.evacuateOffset(() => this.setDate(date));
  }

  public getDay() {
    return this.date.getDay();
  }

  public getUTCDay() {
    return this.evacuateOffset(() => this.getDay());
  }

  public getHours() {
    return this.date.getHours();
  }

  public setHours(hours: number, min?: number, sec?: number, ms?: number) {
    this.date.setHours(hours, min ?? this.getMinutes(), sec ?? this.getSeconds(), ms ?? this.getMilliseconds());
    return this;
  }

  public getUTCHours() {
    return this.evacuateOffset(() => this.getHours());
  }

  public setUTCHours(hours: number, min?: number, sec?: number, ms?: number) {
    return this.evacuateOffset(() => this.setHours(hours, min, sec, ms));
  }

  public getMinutes() {
    return this.date.getMinutes();
  }

  public setMinutes(min: number, sec?: number, ms?: number) {
    this.date.setMinutes(min, sec ?? this.getSeconds(), ms ?? this.getMilliseconds());
    return this;
  }

  public getUTCMinutes() {
    return this.evacuateOffset(() => this.getMinutes());
  }

  public setUTCMinutes(min: number, sec?: number, ms?: number) {
    return this.evacuateOffset(() => this.setMinutes(min, sec, ms));
  }

  public getSeconds() {
    return this.date.getSeconds();
  }

  public setSeconds(sec: number, ms?: number) {
    this.date.setSeconds(sec, ms ?? this.getMilliseconds());
    return this;
  }

  public getUTCSeconds() {
    return this.evacuateOffset(() => this.getSeconds());
  }

  public setUTCSeconds(sec: number, ms?: number) {
    return this.evacuateOffset(() => this.setSeconds(sec, ms));
  }

  public getMilliseconds() {
    return this.date.getMilliseconds();
  }

  public setMilliseconds(ms: number) {
    this.date.setMilliseconds(ms);
    return this;
  }

  public getUTCMilliseconds() {
    return this.evacuateOffset(() => this.getMilliseconds());
  }

  public setUTCMilliseconds(ms: number) {
    return this.evacuateOffset(() => this.setMilliseconds(ms));
  }

  public removeTime() {
    return this.date.setHours(0, 0, 0, 0);
  }

  public addYear(num: number) {
    const d = this.getDate();
    this.setFullYear(this.getFullYear() + num);
    if (d !== this.getDate()) this.date.setDate(0);
    return this;
  }

  public addMonth(num: number) {
    const d = this.getDate();
    this.setMonth(this.getMonth() + num);
    if (d !== this.getDate()) this.date.setDate(0);
    return this;
  }

  public addDate(num: number) {
    this.setDate(this.getDate() + num);
    return this;
  }

  public addHours(num: number) {
    this.setHours(this.getHours() + num);
    return this;
  }

  public addMin(num: number) {
    this.setMinutes(this.getMinutes() + num);
    return this;
  }

  public addSec(num: number) {
    this.setSeconds(this.getSeconds() + num);
    return this;
  }

  public addMs(num: number) {
    this.setMilliseconds(this.getMilliseconds() + num);
    return this;
  }

  public setFirstDateAtYear() {
    this.date.setMonth(0, 1);
    return this;
  }

  public setLastDateAtYear() {
    this.date.setFullYear(this.getFullYear() + 1, 0, 0);
    return this;
  }

  public setFirstDateAtMonth() {
    this.setDate(1);
    return this;
  }

  public setLastDateAtMonth() {
    this.date.setMonth(this.getMonth() + 1, 0);
    return this;
  }

  public setPrevWeek() {
    return this.addDate(-7);
  }

  public setNextWeek() {
    return this.addDate(7);
  }

  public setPrevYear() {
    return this.addYear(-1);
  }

  public setNextYear() {
    return this.addYear(1);
  }

  public setPrevMonth() {
    return this.addMonth(-1);
  }

  public setNextMonth() {
    return this.addMonth(1);
  }

}
