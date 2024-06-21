import { getObjectType } from "../../objects";

const defaultLabel = "値";

export const $arrayValidations = (dataItem: DataItem.$array<any>): Array<DataItem.Validation<DataItem.$array<any>>> => {
  const validations: Array<DataItem.Validation<DataItem.$array<any>>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value }) => {
    if (value == null || getObjectType(value) === "Array") return undefined;
    return { type: "e", code: "type", msg: `${label}は配列型を設定してください。` };
  });

  if (dataItem.required) {
    validations.push(({ value }) => {
      if (value != null) return undefined;
      return { type: "e", code: "required", msg: `${label}を設定してください。` };
    });
  }

  if (dataItem.length != null) {
    validations.push(({ value }) => {
      if (value == null) return undefined;
      if (value.length === dataItem.length!) return undefined;
      return { type: "e", code: "length", msg: `${label}は${dataItem.length}件を設定してください。[${value.length}]` };
    });
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      validations.push(({ value }) => {
        if (value == null) return undefined;
        if (dataItem.minLength! <= value.length && value.length <= dataItem.maxLength!) return undefined;
        return { type: "e", code: "range", msg: `${label}は${dataItem.minLength}件以上${dataItem.maxLength}件以下で設定してください。` };
      });
    } else {
      if (dataItem.minLength != null) {
        validations.push(({ value }) => {
          if (value == null) return undefined;
          if (dataItem.minLength! <= value.length) return undefined;
          return { type: "e", code: "minLength", msg: `${label}は${dataItem.minLength}件以上で設定してください。` };
        });
      }
      if (dataItem.maxLength != null) {
        validations.push(({ value }) => {
          if (value == null) return undefined;
          if (value.length <= dataItem.maxLength!) return undefined;
          return { type: "e", code: "maxLength", msg: `${label}は${dataItem.maxLength}件以下で設定してください。` };
        });
      }
    }
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
