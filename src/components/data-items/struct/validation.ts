import { getObjectType } from "../../objects";

const defaultLabel = "値";

export const $structValidation = (dataItem: DataItem.$struct<any>): Array<DataItem.Validation<DataItem.$struct<any>>> => {
  const validations: Array<DataItem.Validation<DataItem.$struct<any>>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value }) => {
    if (value == null || getObjectType(value) === "Object") return undefined;
    return { type: "e", code: "type", msg: `${label}は連想配列型を設定してください。` };
  });

  if (dataItem.required) {
    validations.push(({ value }) => {
      if (value != null) return undefined;
      return { type: "e", code: "required", msg: `${label}を設定してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
