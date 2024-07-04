import { getObjectType } from "../../objects";

const defaultLabel = "値";

export const $structValidations = (dataItem: DataItem.ArgObject<DataItem.$struct<Array<DataItem.$object>>>): Array<DataItem.Validation<DataItem.$struct<Array<DataItem.$object>>>> => {
  const validations: Array<DataItem.Validation<DataItem.$struct<Array<DataItem.$object>>>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value, fullName }) => {
    if (value == null || getObjectType(value) === "Object") return undefined;
    return { type: "e", code: "type", fullName, msg: `${label}は連想配列型を設定してください。` };
  });

  if (dataItem.required) {
    validations.push(({ value, fullName }) => {
      if (value != null) return undefined;
      return { type: "e", code: "required", fullName, msg: `${label}を設定してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
