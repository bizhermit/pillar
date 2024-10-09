import { DateTime } from "@/objects/datetime";
import { getDataItemLabel } from "../label";

export const $datetimeValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$datetime>): Array<DataItem.Validation<DataItem.$datetime>> => {
  const validations: Array<DataItem.Validation<DataItem.$datetime, DateTime>> = [];
  const s = getDataItemLabel({ dataItem, env });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", { s }),
      };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
