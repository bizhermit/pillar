export type TimeZone =
  | "Z"
  | "UTC"
  | "Asia/Tokyo"
  | "America/Los_Angeles"
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

export class DateTime {

  private date: Date;
  private offset: number;

  constructor(datetime?: string | number | Date | DateTime | null | undefined) {
    this.date = new Date();
    this.offset = this.date.getTimezoneOffset();
    if (datetime != null) {
      this.set(datetime, true);
    }
  }

  public getTimezoneOffset() {
    return this.offset;
  }

  public setTimezoneOffset(offset: number) {
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

  public getTime() {
    return this.date.getTime();
  }

  public set(datetime: string | number | Date | DateTime | null | undefined, resetOffset?: boolean) {
    let diff = (this.date.getTimezoneOffset() - this.offset) * 60000;
    if (datetime == null) {
      this.date.setTime(Date.now() + diff);
    } else if (datetime instanceof DateTime) {
      this.date.setTime(datetime.getTime());
      this.offset = datetime.getTimezoneOffset();
    } else {
      switch (typeof datetime) {
        case "number":
          this.date.setTime(datetime + diff);
          break;
        case "string":
          const a = datetime.match(/^(\d{1,4})[-|\/|年]?(\d{1,2}|$)[-|\/|月]?(\d{1,2}|$)[日]?[\s|T]?(\d{1,2}|$)[:]?(\d{1,2}|$)[:]?(\d{1,2}|$)[.]?(\d{0,3}|$)?(.*)/);
          if (a) {
            const tz = a[8];
            if (tz) {
              const offset = parseTimezoneOffset(tz as TimeZone);
              if (resetOffset) this.offset = offset;
              else diff = (offset - this.date.getTimezoneOffset()) * 60000;
            }
            this.date.setTime(new Date(Number(a[1]), Number(a[2] || 1) - 1, Number(a[3] || 1), Number(a[4] || 0), Number(a[5] || 0), Number(a[6] || 0), Number(a[7] || 0)).getTime() + diff);
          } else {
            this.date.setTime(new Date(datetime).getTime() + diff);
          }
          break;
        default:
          this.date.setTime(datetime.getTime() + diff);
          break;
      }
    }
    return this;
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

  public toISOString() {
    const buf = this.offset;
    const r = this.setTimezoneOffset(0).toString();
    this.setTimezoneOffset(buf);
    return r;
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

  public getYear() {
    return this.date.getFullYear();
  }

  public setYear(year: number, month?: number, date?: number) {
    this.date.setFullYear(year, month ?? this.getMonth(), date ?? this.getDate());
    return this;
  }

  public getMonth() {
    return this.date.getMonth();
  }

  public setMonth(month: number, date?: number) {
    this.date.setMonth(month, date ?? this.getDate());
    return this;
  }

  public getDate() {
    return this.date.getDate();
  }

  public setDate(date: number) {
    this.date.setDate(date);
    return this;
  }

  public getDay() {
    return this.date.getDay();
  }

  public getHours() {
    return this.date.getHours();
  }

  public setHours(hours: number, min?: number, sec?: number, ms?: number) {
    this.date.setHours(hours, min ?? this.getMin(), sec ?? this.getSec(), ms ?? this.getMs());
    return this;
  }

  public getMin() {
    return this.date.getMinutes();
  }

  public setMin(min: number, sec?: number, ms?: number) {
    this.date.setMinutes(min, sec ?? this.getSec(), ms ?? this.getMs());
    return this;
  }

  public getSec() {
    return this.date.getSeconds();
  }

  public setSec(sec: number) {
    this.date.setSeconds(sec);
    return this;
  }

  public getMs() {
    return this.date.getMilliseconds();
  }

  public setMs(ms: number) {
    this.date.setMilliseconds(ms);
    return this;
  }

  public removeTime() {
    return this.date.setHours(0, 0, 0, 0);
  }

  public addYear(num: number) {
    this.setYear(this.getYear() + num);
    return this;
  }

  public addMonth(num: number) {
    this.setMonth(this.getMonth() + num);
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
    this.setMin(this.getMin() + num);
    return this;
  }

  public addSec(num: number) {
    this.setSec(this.getSec() + num);
    return this;
  }

  public addMs(num: number) {
    this.setMs(this.getMs() + num);
    return this;
  }

  public setFirstDateAtYear() {
    this.date.setMonth(0, 1);
    return this;
  }

  public setLastDateAtYear() {
    this.date.setFullYear(this.getYear() + 1, 0, 0);
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
    const d = this.getDate();
    this.addYear(-1);
    if (d !== this.getDate()) this.addDate(this.getDate() * -1);
    return this;
  }

  public setNextYear() {
    const d = this.getDate();
    this.addYear(1);
    if (d !== this.getDate()) this.addDate(this.getDate() * -1);
    return this;
  }

  public setPrevMonth() {
    const d = this.getDate();
    this.addMonth(-1);
    if (d !== this.getDate()) this.addDate(this.getDate() * -1);
    return this;
  }

  public setNextMonth() {
    const d = this.getDate();
    this.addMonth(1);
    if (d !== this.getDate()) this.addDate(this.getDate() * -1);
    return this;
  }

}
