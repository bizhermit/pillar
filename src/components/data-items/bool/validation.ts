import { equals } from "../../objects";

const defaultLabel = "値";

export const $boolValidations = (dataItem: DataItem.ArgObject<DataItem.$boolAny>) => {
  const validations: Array<DataItem.Validation<DataItem.$boolAny>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value, dataItem, fullName }) => {
    if (equals(value, dataItem.trueValue)) return undefined;
    if (equals(value, dataItem.falseValue)) {
      if (dataItem.requiredIsTrue) return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
      return undefined;
    }
    if (value == null) {
      if (dataItem.required) return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
      return undefined;
    }
    return { type: "e", code: "required", fullName, msg: `${label}は有効な値を設定してください。` };
  });

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
