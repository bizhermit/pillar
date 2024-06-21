import { parseDate } from "../../objects/date";

const defaultLabel = "値";

export const $dateParse = (value: any, dataItem: DataItem.$date | DataItem.$month): DataItem.ParseResult<Date> => {
  if (value == null || value === "") return [undefined];

  const label = dataItem.label || defaultLabel;
  try {
    if (value instanceof Date) {
      if (dataItem.type === "month") value.setDate(1);
      return [value];
    }
    const d = parseDate(value);
    if (d == null) throw new Error;
    if (dataItem.type === "month") d.setDate(1);
    return [d, { type: "i", code: "parse", msg: `${label}を日付型に変換しました。[${value}]->[${d}]` }];
  } catch {
    return [undefined, { type: "e", code: "parse", msg: `${label}を日付型に変換できません。[${value}]` }];
  }
};
