import { DateTime } from "@/objects/datetime";

const defaultLabel = "値";

export const $datetimeValidations = (dataItem: DataItem.ArgObject<DataItem.$datetime>): Array<DataItem.Validation<DataItem.$datetime>> => {
  const validations: Array<DataItem.Validation<DataItem.$datetime, DateTime>> = [];

  const label = dataItem.label || dataItem.name || defaultLabel;

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を入力してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
