import { parseNum } from "../../objects/number";
import { Time } from "../../objects/time";

const defaultLabel = "値";

export const $timeParse = (value: any, dataItem: DataItem.$time): DataItem.ParseResult<number> => {
  if (value == null || value === "") return [undefined];
  if (typeof value === "number") return [value];

  const label = dataItem.label || defaultLabel;
  try {
    if (typeof value === "string" && /^\d*$/.test(value)) {
      const num = parseNum(value);
      return [num, { type: "i", code: "parse", msg: `${label}を数値型に変換しました。[${value}]->[${num}]` }];
    }
    const t = new Time(value);
    if (t == null) throw new Error;
    const tnum = t.getMilliseconds();
    if (value === tnum) return [value];
    return [tnum, { type: "i", code: "parse", msg: `${label}を数値型に変換しました。[${value}]->[${tnum}]` }];
  } catch {
    return [undefined, { type: "e", code: "parse", msg: `${label}を数値型に変換できません。[${value}]` }];
  }
};
