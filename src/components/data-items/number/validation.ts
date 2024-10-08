import { getFloatPosition } from "../../objects/number";
import { getDataItemLabel } from "../label";

export const $numValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$num>, skipSourceCheck?: boolean): Array<DataItem.Validation<DataItem.$num>> => {
  const validations: Array<DataItem.Validation<DataItem.$num>> = [];
  const s = getDataItemLabel({ dataItem, env });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) {
        if (p.value === 0 && dataItem.requiredIsNotZero) {
          return {
            type: "e",
            code: "required",
            fullName: p.fullName,
            msg: env.lang("validation.required", { s }),
          };
        }
        return undefined;
      }
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", {
          s,
          mode: dataItem.source ? "select" : "input",
        }),
      };
    });
  }

  if (dataItem.min != null && dataItem.max != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (dataItem.min! <= value && value <= dataItem.max!) return undefined;
      return {
        type: "e",
        code: "range",
        fullName,
        msg: env.lang("validation.range", {
          s,
          min: dataItem.min,
          max: dataItem.max,
        }),
      };
    });
  } else {
    if (dataItem.min != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (dataItem.min! <= value) return undefined;
        return {
          type: "e",
          code: "min",
          fullName,
          msg: env.lang("validation.min", {
            s,
            min: dataItem.min,
          }),
        };
      });
    }
    if (dataItem.max != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (value <= dataItem.max!) return undefined;
        return {
          type: "e",
          code: "max",
          fullName,
          msg: env.lang("validation.max", {
            s,
            max: dataItem.max,
          }),
        };
      });
    }
  }

  if (dataItem.float != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      const cur = getFloatPosition(value);
      if (cur <= dataItem.float!) return undefined;
      return {
        type: "e",
        code: "float",
        fullName,
        msg: env.lang("validation.float", {
          s,
          float: dataItem.float,
          cur,
        }),
      };
    });
  }

  if (!skipSourceCheck && dataItem.source) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (dataItem.source!.find(s => s.value === value)) return undefined;
      return {
        type: "e",
        code: "source",
        fullName,
        msg: env.lang("validation.contain", { s }),
      };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
