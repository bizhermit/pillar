import { equals, getObjectType } from "../../objects";
import { getDataItemLabel } from "../label";

export const $arrayValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$array<any>>, skipSourceCheck?: boolean): Array<DataItem.Validation<DataItem.$array<any>>> => {
  const validations: Array<DataItem.Validation<DataItem.$array<any>>> = [];
  const s = getDataItemLabel({ dataItem, env });

  validations.push(({ value, fullName }) => {
    if (value == null || getObjectType(value) === "Array") return undefined;
    return {
      type: "e",
      code: "type",
      fullName,
      msg: env.lang("validation.typeOf", {
        s,
        type: env.lang("common.typeOfArray"),
        mode: "set",
      }),
    };
  });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", { s, mode: "set" }),
      };
    });
  }

  if (dataItem.length != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (value.length === dataItem.length!) return undefined;
      return {
        type: "e",
        code: "length",
        fullName,
        msg: env.lang("validation.number", {
          s,
          num: dataItem.length,
          cur: value.length,
        }),
      };
    });
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        const cur = value.length;
        if (dataItem.minLength! <= cur && cur <= dataItem.maxLength!) return undefined;
        return {
          type: "e",
          code: "range",
          fullName,
          msg: env.lang("validation.rangeNumber", {
            s,
            minNum: dataItem.minLength,
            maxNum: dataItem.maxLength,
            cur,
          }),
        };
      });
    } else {
      if (dataItem.minLength != null) {
        validations.push(({ value, fullName }) => {
          if (value == null) return undefined;
          const cur = value.length;
          if (dataItem.minLength! <= cur) return undefined;
          return {
            type: "e",
            code: "minLength",
            fullName,
            msg: env.lang("validation.minNumber", {
              s,
              minNum: dataItem.minLength,
              cur,
            }),
          };
        });
      }
      if (dataItem.maxLength != null) {
        validations.push(({ value, fullName }) => {
          if (value == null) return undefined;
          const cur = value.length;
          if (cur <= dataItem.maxLength!) return undefined;
          return {
            type: "e",
            code: "maxLength",
            fullName,
            msg: env.lang("validation.maxNumber", {
              s,
              maxNum: dataItem.maxLength,
              cur,
            }),
          };
        });
      }
    }
  }

  if (!skipSourceCheck && dataItem.source) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      const notFoundVals = (value as Array<any>).filter(v => !dataItem.source!.some(s => equals(s.value, v)));
      if (notFoundVals == null || notFoundVals.length === 0) return undefined;
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
