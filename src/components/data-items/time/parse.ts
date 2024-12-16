import { getTimeUnit, parseMilliseconds, parseTimeAsUnit, roundTime, Time } from "../../objects/time";
import { getDataItemLabel } from "../label";

export const $timeParse = ({ value, dataItem, fullName, env }: DataItem.ParseProps<DataItem.$time>): DataItem.ParseResult<number> => {
  const s = getDataItemLabel({ dataItem, env });

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, {
      type: "e",
      code: "multiple",
      fullName,
      msg: env.lang("validation.single", { s }),
    }];
  }
  if (value == null || value === "") return [undefined];

  const unit = getTimeUnit(dataItem.mode ?? "hm");
  const time = parseMilliseconds(value, unit);
  let num = parseTimeAsUnit(time, unit);
  if (num == null) {
    return [undefined, {
      type: "e",
      code: "parse",
      fullName,
      msg: env.lang("validation.parseFailed", {
        s,
        type: env.lang("common.typeOfNumber"),
        value,
      }),
    }];
  }
  const t = new Time(num, unit);
  t.setHours(roundTime(t.getHours(), dataItem.hourStep ?? 1));
  t.setMinutes(roundTime(t.getMinutes(), dataItem.minuteStep ?? 1));
  t.setSeconds(roundTime(t.getSeconds(), dataItem.secondStep ?? 1));
  num = parseTimeAsUnit(t.getTime(), unit);
  if (num === value) return [num];
  return [num, {
    type: "i",
    code: "parse",
    fullName,
    msg: env.lang("validation.parseSucceeded", {
      s,
      type: env.lang("common.typeOfNumber"),
      before: value,
      after: num,
    }),
  }];
};
