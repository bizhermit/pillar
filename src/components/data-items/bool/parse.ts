import { equals } from "../../objects";
import { parseNum } from "../../objects/number";
import { getDataItemLabel } from "../label";

export const $boolParse = <V extends boolean | number | string>({ value, dataItem, fullName, env }: DataItem.ParseProps<DataItem.$bool<any, any> | DataItem.$boolNum<any, any> | DataItem.$boolStr<any, any>>): DataItem.ParseResult<V> => {
  const s = getDataItemLabel({ dataItem, env });

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, { type: "e", code: "multiple", fullName, msg: env.lang("validation.single", { s }) }];
  }

  if (value == null || equals(value, dataItem.trueValue) || equals(value, dataItem.falseValue)) return [value];

  switch (dataItem.type) {
    case "bool":
      if (typeof value === "string") {
        if (value === String(dataItem.trueValue)) {
          return [dataItem.trueValue as V, {
            type: "i",
            code: "parse",
            fullName,
            msg: env.lang("validation.parseSucceeded", {
              s,
              type: env.lang("common.typeOfBool"),
              before: value,
              after: dataItem.trueValue,
            }),
          }];
        }
        if (value === String(dataItem.falseValue)) {
          return [dataItem.falseValue as V, {
            type: "i",
            code: "parse",
            fullName,
            msg: env.lang("validation.parseSucceeded", {
              s,
              type: env.lang("common.typeOfBool"),
              before: value,
              after: dataItem.falseValue,
            }),
          }];
        }
      }
      break;
    case "b-num":
      if (typeof value === "string") {
        const num = parseNum(value);
        if (num === dataItem.trueValue) {
          return [dataItem.trueValue as V, {
            type: "i",
            code: "parse",
            fullName,
            msg: env.lang("validation.parseSucceeded", {
              s,
              type: env.lang("common.typeOfBool"),
              before: value,
              after: dataItem.trueValue,
            }),
          }];
        }
        if (num === dataItem.falseValue) {
          return [dataItem.falseValue as V, {
            type: "i",
            code: "parse",
            fullName,
            msg: env.lang("validation.parseSucceeded", {
              s,
              type: env.lang("common.typeOfBool"),
              before: value,
              after: dataItem.falseValue,
            }),
          }];
        }
      }
      break;
    default:
      if (typeof value === "number") {
        const str = String(value);
        if (str === dataItem.trueValue) {
          return [dataItem.trueValue as V, {
            type: "i",
            code: "parse",
            fullName,
            msg: env.lang("validation.parseSucceeded", {
              s,
              type: env.lang("common.typeOfBool"),
              before: value,
              after: dataItem.trueValue,
            }),
          }];
        }
        if (str === dataItem.falseValue) {
          return [dataItem.falseValue as V, {
            type: "i",
            code: "parse",
            fullName,
            msg: env.lang("validation.parseSucceeded", {
              s,
              type: env.lang("common.typeOfBool"),
              before: value,
              after: dataItem.falseValue,
            }),
          }];
        }
      }
      break;
  }

  return [undefined, {
    type: "e",
    code: "parse",
    fullName,
    msg: env.lang("validation.parseFailed", { s, type: env.lang("common.typeOfBool"), value }),
  }];
};
