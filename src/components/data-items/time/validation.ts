import { formatTime, getTimeUnit, parseMilliseconds, parseTimeAsUnit } from "../../objects/time";
import { getDataItemLabel } from "../label";

export const $timeValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$time>): Array<DataItem.Validation<DataItem.$time>> => {
  const validations: Array<DataItem.Validation<DataItem.$time>> = [];
  const s = getDataItemLabel({ dataItem, env });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", { s }),
      };
    });
  }

  const formatPattern = dataItem.mode === "hms" ? "hh:mm:ss" : dataItem.mode === "ms" ? "mm:ss" : "hh:mm";
  const unit = getTimeUnit(dataItem.mode ?? "hm");

  const min = dataItem.min == null ? 0 : parseTimeAsUnit(parseMilliseconds(dataItem.min, unit), unit);
  const max = dataItem.max == null ? 0 : parseTimeAsUnit(parseMilliseconds(dataItem.max, unit), unit);
  const minStr = dataItem.min == null ? "" : formatTime(parseMilliseconds(dataItem.min, unit)!, formatPattern);
  const maxStr = dataItem.max == null ? "" : formatTime(parseMilliseconds(dataItem.max, unit)!, formatPattern);
  if (dataItem.min != null && dataItem.max != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (min! <= value && value <= max!) return undefined;
      return {
        type: "e",
        code: "range",
        fullName,
        msg: env.lang("validation.rangeDate", {
          s,
          minDate: minStr,
          maxDate: maxStr,
        }),
      };
    });
  } else {
    if (dataItem.min != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (min! <= value) return undefined;
        return {
          type: "e",
          code: "min",
          fullName,
          msg: env.lang("validation.minDate", {
            s,
            minDate: minStr,
          }),
        };
      });
    }
    if (dataItem.max != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (value <= max!) return undefined;
        return {
          type: "e",
          code: "max",
          fullName,
          msg: env.lang("validation.maxDate", {
            s,
            maxDate: maxStr,
          }),
        };
      });
    }
  }

  if (dataItem.pair) {
    validations.push(({ value, siblings, data, fullName }) => {
      if (value == null) return undefined;
      const pairName = dataItem.pair!.name;
      const pairDataItem = siblings?.find(time => time.name === pairName) as DataItem.ArgObject<DataItem.$time> | null | undefined;
      if (pairDataItem != null && pairDataItem.type !== "time") return undefined;
      const pairTime = data?.[pairName];
      if (pairTime == null) return undefined;
      if (!dataItem.pair?.same) {
        if (pairTime === value) return undefined;
      }
      if (dataItem.pair?.position === "before") {
        if (value < pairTime) return undefined;
        return {
          type: "e",
          code: "pair-after",
          fullName,
          msg: pairDataItem?.pair ? "" : env.lang("validation.contextTime", { s }),
        };
      }
      if (value > pairTime) return undefined;
      return {
        type: "e",
        code: "pair-before",
        fullName,
        msg: env.lang("validation.contextTime", { s }),
      };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
