import { Time, TimeUtils } from "../../objects/time";

const defaultLabel = "値";

export const $timeValidations = (dataItem: DataItem.ArgObject<DataItem.$time>): Array<DataItem.Validation<DataItem.$time>> => {
  const validations: Array<DataItem.Validation<DataItem.$time>> = [];

  const label = dataItem.label || defaultLabel;

  if (dataItem.required) {
    validations.push(({ value, fullName }) => {
      if (value != null) return undefined;
      return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
    });
  }

  const formatPattern = dataItem.mode === "hm" ? "hh:mm" : dataItem.mode === "ms" ? "mm:ss" : "hh:mm:ss";

  const minTime = new Time(dataItem.min);
  const maxTime = new Time(dataItem.max);
  const minStr = dataItem.min == null ? "" : minTime.format(formatPattern);
  const maxStr = dataItem.max == null ? "" : maxTime.format(formatPattern);
  if (dataItem.min != null && dataItem.max != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (dataItem.min! <= value && value <= dataItem.max!) return undefined;
      return { type: "e", code: "range", fullName, msg: `${label}は${minStr}～${maxStr}の範囲で入力してください。` };
    });
  } else {
    if (dataItem.min != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (dataItem.min! <= value) return undefined;
        return { type: "e", code: "min", fullName, msg: `${label}は${minStr}以降を入力してください。` };
      });
    }
    if (dataItem.max != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (value <= dataItem.max!) return undefined;
        return { type: "e", code: "max", fullName, msg: `${label}は${maxStr}以前を入力してください。` };
      });
    }
  }

  if (dataItem.pair) {
    validations.push(({ value, siblings, data, fullName }) => {
      if (value == null) return undefined;
      const pairDataItem = siblings?.find(time => time.name === dataItem.pair!.name);
      if (!pairDataItem || pairDataItem.type !== "time") return undefined;
      const pairTime = data?.[pairDataItem.name];
      if (pairTime == null) return undefined;
      if (dataItem.pair?.same) {
        if (pairTime === value) return undefined;
      }
      if (dataItem.pair?.position === "before") {
        if (value < pairTime) return undefined;
        return { type: "e", code: "pair-before", fullName, msg: `時間の前後関係が不適切です。${dataItem.label ? `[${dataItem.label}]` : ""}${TimeUtils.format(value, formatPattern)} - ${pairDataItem.label ? `[${pairDataItem.label}]` : ""}${TimeUtils.format(pairTime, formatPattern)}` };
      }
      if (value > pairTime) return undefined;
      return { type: "e", code: "pair-after", fullName, msg: pairDataItem.pair ? "" : `時間の前後関係が不適切です。${pairDataItem.label ? `[${pairDataItem.label}]` : ""}${TimeUtils.format(pairTime, formatPattern)} - ${dataItem.label ? `[${dataItem.label}]` : ""}${TimeUtils.format(value, formatPattern)}` };
    });
  }

  return validations;
};
