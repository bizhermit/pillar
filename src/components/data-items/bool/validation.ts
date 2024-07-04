import { equals } from "../../objects";

const defaultLabel = "値";

export const $boolValidations = (dataItem: DataItem.ArgObject<DataItem.$bool<boolean, boolean> | DataItem.$boolNum<number, number> | DataItem.$boolStr<string, string>>) => {
  const validations: Array<DataItem.Validation<DataItem.$bool<boolean, boolean> | DataItem.$boolNum<number, number> | DataItem.$boolStr<string, string>>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value, dataItem, fullName }) => {
    if (equals(value, dataItem.trueValue) || equals(value, dataItem.falseValue)) return undefined;
    if (dataItem.required && value == null) return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
    return { type: "e", code: "required", fullName, msg: `${label}は有効な値を設定してください。` };
  });

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
