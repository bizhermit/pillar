import { equals } from "../../objects";

const defaultLabel = "値";

export const $boolValidations = (dataItem: DataItem.ArgObject<DataItem.$boolAny>) => {
  const validations: Array<DataItem.Validation<DataItem.$boolAny>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push((p) => {
    if (equals(p.value, p.dataItem.trueValue)) return undefined;
    const $required = typeof p.dataItem.required === "function" ? p.dataItem.required(p) : p.dataItem.required;
    if (equals(p.value, p.dataItem.falseValue)) {
      if ($required && p.dataItem.requiredIsTrue) return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を入力してください。` };
      return undefined;
    }
    if (p.value == null) {
      if ($required) return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を入力してください。` };
      return undefined;
    }
    return { type: "e", code: "required", fullName: p.fullName, msg: `${label}は有効な値を設定してください。` };
  });

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
