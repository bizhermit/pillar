import { getObjectType } from "../../objects";
import { getDataItemLabel } from "../label";

export const $structValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$struct<Array<DataItem.$object>>>): Array<DataItem.Validation<DataItem.$struct<Array<DataItem.$object>>>> => {
  const validations: Array<DataItem.Validation<DataItem.$struct<Array<DataItem.$object>>>> = [];
  const s = getDataItemLabel({ dataItem, env });

  validations.push(({ value, fullName }) => {
    if (value == null || getObjectType(value) === "Object") return undefined;
    return {
      type: "e",
      code: "type",
      fullName,
      msg: env.lang("validation.typeOf", {
        s,
        type: env.lang("common.typeOfStruct"),
        mode: "set",
      }),
    };
  });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", { s, mode: "set" }),
      };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations as typeof validations);
  }

  return validations;
};
