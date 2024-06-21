import { parseNum } from "../../objects/number";

const defaultLabel = "値";

export const $numParse = <V extends number>(value: any, dataItem: DataItem.$num<V>, skipRefSource?: boolean): DataItem.ParseResult<V | DataItem.NullValue> => {
  const label = dataItem.label || defaultLabel;
  try {
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
    if (dataItem.source && !skipRefSource && !dataItem.source.find(s => s.id === v)) {
      return [v, { type: "e", code: "source", msg: `${change ? `${label}を数値型に変換しました。[${value}]->[${v}]\n` : ""}${label}は有効な値を設定してください。` }];
    }
    return change ? [v, { type: "i", code: "parse", msg: `${label}を数値型に変換しました。[${value}]->[${v}]` }] : [v];
  } catch {
    return [undefined, { type: "e", code: "parse", msg: `${label}を数値型に変換できません。[${value}]` }];
  }
};
