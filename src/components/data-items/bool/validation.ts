import { equals } from "../../objects";
import { getDataItemLabel } from "../label";

export const $boolValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$boolAny>) => {
  const validations: Array<DataItem.Validation<DataItem.$boolAny>> = [];
  const label = getDataItemLabel({ dataItem, env });

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
