import { parseDate } from "../../objects/date";
import { getDataItemLabel } from "../label";

export const $dateParse = ({ value, dataItem, fullName, env }: DataItem.ParseProps<DataItem.$date | DataItem.$month>): DataItem.ParseResult<Date> => {
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

  try {
    if (value instanceof Date) {
      if (dataItem.type === "month") value.setDate(1);
      return [value];
    }
    const d = parseDate(value);
    if (d == null) throw new Error;
    if (dataItem.type === "month") d.setDate(1);
    return [d, {
      type: "i",
      code: "parse",
      fullName,
      msg: env.lang("validation.parseSucceeded", {
        s,
        type: env.lang("common.typeOfDate"),
        before: value,
        after: d,
      }),
    }];
  } catch {
    return [undefined, {
      type: "e",
      code: "parse",
      fullName,
      msg: env.lang("validation.parseFailed", {
        s,
        type: env.lang("common.typeOfDate"),
        value,
      }),
    }];
  }
};
