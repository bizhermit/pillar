import { equalDate, formatDate, getFirstDateAtMonth, getLastDateAtMonth, isAfterDate, isBeforeDate, parseDate } from "../../objects/date";

const defaultLabel = "値";

export const $dateValidations = (dataItem: DataItem.ArgObject<DataItem.$date | DataItem.$month>): Array<DataItem.Validation<DataItem.$date | DataItem.$month>> => {
  const validations: Array<DataItem.Validation<DataItem.$date | DataItem.$month>> = [];

  const label = dataItem.label || defaultLabel;
  const dateFormatPattern = dataItem.type === "month" ? "yyyy/MM" : "yyyy/MM/dd";

  if (dataItem.required) {
    validations.push(({ value, fullName }) => {
      if (value != null) return undefined;
      return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
    });
  }

  let min = dataItem.min ? parseDate(dataItem.min) : null;
  let max = dataItem.max ? parseDate(dataItem.max) : null;
  if (dataItem.type === "month") {
    if (min) min = getFirstDateAtMonth(min);
    if (max) max = getLastDateAtMonth(max);
  }
  const minStr = min ? formatDate(min, dateFormatPattern) : "";
  const maxStr = max ? formatDate(max, dateFormatPattern) : "";
  if (min != null && max != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      const t = value.getTime();
      if (min.getTime() >= t && t <= max.getTime()) return undefined;
      return { type: "e", code: "range", fullName, msg: `${label}は${minStr}～${maxStr}の範囲で入力してください。` };
    });
  } else {
    if (min != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (min.getTime() >= value.getTime()) return undefined;
        return { type: "e", code: "min", fullName, msg: `${label}は${minStr}以降を入力してください。` };
      });
    }
    if (max != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (value.getTime() <= max.getTime()) return undefined;
        return { type: "e", code: "max", fullName, msg: `${label}は${maxStr}以前を入力してください。` };
      });
    }
  }

  if (dataItem.pair) {
    validations.push(({ value, siblings, data, fullName }) => {
      if (value == null) return undefined;
      const pairDataItem = siblings?.find(item => item.name === dataItem.pair!.name);
      if (!pairDataItem || (pairDataItem.type !== "date" && pairDataItem.type !== "month")) return undefined;
      const pairDate = parseDate(data?.[pairDataItem.name]);
      if (pairDate == null) return undefined;
      if (dataItem.pair?.same) {
        if (equalDate(pairDate, value)) return undefined;
      }
      if (dataItem.pair?.position === "before") {
        if (isAfterDate(pairDate, value)) return undefined;
        return {
          type: "e",
          code: "pair-before",
          fullName,
          msg: `日付の前後関係が不適切です。${dataItem.label ? `[${dataItem.label}]` : ""}${formatDate(value, dateFormatPattern)} - ${pairDataItem.label ? `[${pairDataItem.label}]` : ""}${formatDate(pairDate, dateFormatPattern)}`,
        };
      }
      if (isBeforeDate(pairDate, value)) return undefined;
      return {
        type: "e",
        code: "pair-after",
        fullName,
        msg: pairDataItem.pair ? "" : `日付の前後関係が不適切です。${pairDataItem.label ? `[${pairDataItem.label}]` : ""}${formatDate(pairDate, dateFormatPattern)} - ${dataItem.label ? `[${dataItem.label}]` : ""}${formatDate(value, dateFormatPattern)}`,
      };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
