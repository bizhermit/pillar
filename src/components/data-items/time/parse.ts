import { parseMilliseconds, parseTimeAsUnit } from "../../objects/time";

const defaultLabel = "値";

export const $timeParse = ({ value, dataItem, fullName }: DataItem.ParseProps<DataItem.$time>): DataItem.ParseResult<number> => {
  if (Array.isArray(value) && value.length > 1) {
    return [undefined, { type: "e", code: "multiple", fullName, msg: `${dataItem.label || defaultLabel}が複数設定されています。` }];
  }
  if (value == null || value === "") return [undefined];

  const label = dataItem.label || dataItem.name || defaultLabel;

  const time = parseMilliseconds(value);
  const num = parseTimeAsUnit(time, (() => {
    switch (dataItem.mode) {
      case "hms":
      case "ms":
        return "s";
      default:
        return "m";
    }
  })());
  if (num == null) {
    return [undefined, { type: "e", code: "parse", fullName, msg: `${label}を数値型に変換できません。[${value}]` }];
  }
  if (num === value) return [num];
  return [num, { type: "i", code: "parse", fullName, msg: `${label}を数値型に変換しました。[${value}]->[${num}]` }];
};
