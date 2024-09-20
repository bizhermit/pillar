import { DateTime } from "../../objects/datetime";
import { get } from "../../objects/struct";
import { getTimeUnit } from "../../objects/time";
import { $dateParse } from "../date/parse";
import { $timeParse } from "../time/parse";

const defaultLabel = "値";

export const $datetimeParse = ({ value, dataItem, fullName, data, env }: DataItem.ParseProps<DataItem.$datetime>): DataItem.ParseResult<DateTime> => {
  const label = dataItem.label || dataItem.name || defaultLabel;

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, { type: "e", code: "multiple", fullName, msg: `${label}が複数設定されています。` }];
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
    if (dateValue == null || dateRes?.type === "e") return [undefined, { type: "e", code: "parse", fullName, msg: `${label}を日付型に変換できません。` }];
    const dt = new DateTime().setDateTime({
      date: dateVal as string,
      time: timeValue,
      timeUnit: getTimeUnit(dataItem.time.mode ?? "hm"),
      tzOffset: env.tzOffset,
    });
    return [dt, { type: "i", code: "parse", fullName, msg: `${label}を日付型に変換しました。` }];
  }

  if (value instanceof DateTime) return [value];
  return [new DateTime(value), { type: "i", code: "parse", fullName, msg: `${label}を日付型に変換しました。` }];
};
