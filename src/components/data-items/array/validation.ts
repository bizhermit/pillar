import { getObjectType } from "../../objects";

const defaultLabel = "値";

export const $arrayValidations = (dataItem: DataItem.ArgObject<DataItem.$array<any>>): Array<DataItem.Validation<DataItem.$array<any>>> => {
  const validations: Array<DataItem.Validation<DataItem.$array<any>>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value, fullName }) => {
    if (value == null || getObjectType(value) === "Array") return undefined;
    return { type: "e", code: "type", fullName, msg: `${label}は配列型を設定してください。` };
  });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を設定してください。` };
    });
  }

  if (dataItem.length != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (value.length === dataItem.length!) return undefined;
      return { type: "e", code: "length", fullName, msg: `${label}は${dataItem.length}件を設定してください。[${value.length}]` };
    });
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (dataItem.minLength! <= value.length && value.length <= dataItem.maxLength!) return undefined;
        return { type: "e", code: "range", fullName, msg: `${label}は${dataItem.minLength}件以上${dataItem.maxLength}件以下で設定してください。` };
      });
    } else {
      if (dataItem.minLength != null) {
        validations.push(({ value, fullName }) => {
          if (value == null) return undefined;
          if (dataItem.minLength! <= value.length) return undefined;
          return { type: "e", code: "minLength", fullName, msg: `${label}は${dataItem.minLength}件以上で設定してください。` };
        });
      }
      if (dataItem.maxLength != null) {
        validations.push(({ value, fullName }) => {
          if (value == null) return undefined;
          if (value.length <= dataItem.maxLength!) return undefined;
          return { type: "e", code: "maxLength", fullName, msg: `${label}は${dataItem.maxLength}件以下で設定してください。` };
        });
      }
    }
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
