import { getDataItemLabel } from "../label";

export const $strParse = <V extends string>({ value, dataItem, fullName, env }: DataItem.ParseProps<DataItem.$object>, skipRefSource?: boolean): DataItem.ParseResult<V> => {
  const s = getDataItemLabel({ dataItem, env });

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, {
      type: "e",
      code: "multiple",
      fullName,
      msg: env.lang("validation.single"),
    }];
  }

  const v = (value == null || typeof value === "string") ? value : String(value);
  if (!skipRefSource) {
    const source = (dataItem as DataItem.$str)["source"];
    if (source && !source.find(s => s.value === v)) {
      return [v, {
        type: "e",
        code: "source",
        fullName,
        msg: env.lang("validation.contain", { s }),
      }];
    }
  }
  return [v];
};
