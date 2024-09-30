import { parseDate } from "../../objects/date";

const defaultLabel = "値";

export const $dateParse = ({ value, dataItem, fullName }: DataItem.ParseProps<DataItem.$date | DataItem.$month>): DataItem.ParseResult<Date> => {
  const label = dataItem.label || dataItem.name || defaultLabel;

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, { type: "e", code: "multiple", fullName, msg: `${label}が複数設定されています。` }];
  }
  if (value == null || value === "") return [undefined];

  try {
    if (value instanceof Date) {
      if (dataItem.type === "month") value.setDate(1);
      return [value];
    }
    const d = parseDate(value);
    if (d == null) throw new Error;
    if (dataItem.type === "month") d.setDate(1);
    return [d, { type: "i", code: "parse", fullName, msg: `${label}を日付型に変換しました。[${value}]->[${d}]` }];
  } catch {
    return [undefined, { type: "e", code: "parse", fullName, msg: `${label}を日付型に変換できません。[${value}]` }];
  }
};
