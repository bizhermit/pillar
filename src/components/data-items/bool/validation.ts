import { equals } from "../../objects";

const defaultLabel = "値";

export const $boolValidations = (dataItem: DataItem.$bool<boolean, boolean> | DataItem.$boolNum<number, number> | DataItem.$boolStr<string, string>) => {
  const validations: Array<DataItem.Validation<DataItem.$bool<boolean, boolean> | DataItem.$boolNum<number, number> | DataItem.$boolStr<string, string>>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value, self }) => {
    if (equals(value, dataItem.trueValue) || equals(value, dataItem.falseValue)) return undefined;
    if (self.required && value == null) return { type: "e", code: "required", msg: `${label}を入力してください。` };
    return { type: "e", code: "required", msg: `${label}は有効な値を設定してください。` };
  });

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
