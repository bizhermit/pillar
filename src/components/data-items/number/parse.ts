import { parseNum } from "../../objects/number";

const defaultLabel = "値";

export const $numParse = <V extends number>({ value, dataItem, fullName }: DataItem.ParseProps<DataItem.$num<V> | DataItem.$boolNum<V, V>>, skipRefSource?: boolean): DataItem.ParseResult<V> => {
  const label = dataItem.label || defaultLabel;

  try {
    if (Array.isArray(value) && value.length > 1) {
      return [undefined, { type: "e", code: "multiple", fullName, msg: `${dataItem.label || defaultLabel}が複数設定されています。` }];
    }

    let v: V | DataItem.NullValue, change = false;
    if (value == null || typeof value === "number") {
      v = value;
    } else {
      if (typeof value === "string" && value.trim() === "") {
        v = undefined;
      } else {
        v = parseNum(value) as V | DataItem.NullValue;
        if (v == null || isNaN(v)) throw new Error;
      }
      change = true;
    }

    if (!skipRefSource) {
      const source = (dataItem as DataItem.$num)["source"];
      if (source && !source.find(s => s.value === v)) {
        return [v, { type: "e", code: "source", fullName, msg: `${change ? `${label}を数値型に変換しました。[${value}]->[${v}]\n` : ""}${label}は有効な値を設定してください。` }];
      }
    }
    return change ? [v, { type: "i", code: "parse", fullName, msg: `${label}を数値型に変換しました。[${value}]->[${v}]` }] : [v];
  } catch {
    return [undefined, { type: "e", code: "parse", fullName, msg: `${label}を数値型に変換できません。[${value}]` }];
  }
};
