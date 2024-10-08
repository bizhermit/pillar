import { DateTime } from "../../objects/datetime";
import { get } from "../../objects/struct";
import { getTimeUnit } from "../../objects/time";
import { $dateParse } from "../date/parse";
import { getDataItemLabel } from "../label";
import { $timeParse } from "../time/parse";

export const $datetimeParse = ({ value, dataItem, fullName, data, env }: DataItem.ParseProps<DataItem.$datetime>): DataItem.ParseResult<DateTime> => {
  const s = getDataItemLabel({ dataItem, env });

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, {
      type: "e",
      code: "multiple",
      fullName,
      msg: env.lang("validation.single", { s }),
    }];
  }
  if (value == null || value === "") {
    const dateVal = get(data, dataItem.date.name)[0];
    const [dateValue, dateRes] = $dateParse({
      value: dateVal,
      data,
      dataItem: dataItem.date,
      fullName: dataItem.date.name,
      env,
    });
    const [timeValue] = $timeParse({
      value: get(data, dataItem.time.name)[0],
      data,
      dataItem: dataItem.time,
      fullName: dataItem.time.name,
      env,
    });
    if (dateValue == null && timeValue == null) return [undefined];
    if (dateValue == null || dateRes?.type === "e") {
      return [undefined, {
        type: "e",
        code: "parse",
        fullName,
        msg: env.lang("validation.parseFailed", {
          s,
          type: env.lang("common.typeOfDateTime"),
          value,
        }),
      }];
    }
    const dt = new DateTime().setDateTime({
      date: dateVal as string,
      time: timeValue,
      timeUnit: getTimeUnit(dataItem.time.mode ?? "hm"),
      timezone: dataItem.tz ?? env.tzOffset,
    });
    return [dt, {
      type: "i",
      code: "parse",
      fullName,
      msg: env.lang("validation.parseSucceeded", {
        s,
        type: env.lang("common.typeOfDateTime"),
        before: value,
        after: dt,
      }),
    }];
  }

  if (value instanceof DateTime) return [value];
  const dt = new DateTime(value);
  return [dt, {
    type: "i",
    code: "parse",
    fullName,
    msg: env.lang("validation.parseSucceeded", {
      s,
      type: env.lang("common.typeOfDateTime"),
      before: value,
      after: dt,
    }),
  }];
};
