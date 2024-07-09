import { getFloatPosition } from "../../objects/number";

const defaultLabel = "値";

export const $numValidations = (dataItem: DataItem.ArgObject<DataItem.$num>): Array<DataItem.Validation<DataItem.$num>> => {
  const validations: Array<DataItem.Validation<DataItem.$num>> = [];

  const label = dataItem.label || defaultLabel;

  if (dataItem.required) {
    validations.push(({ value, fullName }) => {
      if (value != null) {
        if (value === 0 && dataItem.requiredIsNotZero) return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
        return undefined;
      }
      return { type: "e", code: "required", fullName, msg: `${label}を入力してください。` };
    });
  }

  if (dataItem.min != null && dataItem.max != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (dataItem.min! <= value && value <= dataItem.max!) return undefined;
      return { type: "e", code: "range", fullName, msg: `${label}は${dataItem.min}以上${dataItem.max}以下で入力してください。` };
    });
  } else {
    if (dataItem.min != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (dataItem.min! <= value) return undefined;
        return { type: "e", code: "min", fullName, msg: `${label}は${dataItem.min}以上で入力してください。` };
      });
    }
    if (dataItem.max != null) {
      validations.push(({ value, fullName }) => {
        if (value == null) return undefined;
        if (value <= dataItem.max!) return undefined;
        return { type: "e", code: "max", fullName, msg: `${label}は${dataItem.max}以下で入力してください。` };
      });
    }
  }

  if (dataItem.float != null) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      const fp = getFloatPosition(value);
      if (fp <= dataItem.float!) return undefined;
      return { type: "e", code: "float", fullName, msg: `${label}は少数第${dataItem.float}位までで入力してください。[${fp}]` };
    });
  }

  if (dataItem.source) {
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (dataItem.source!.find(s => s.value === value)) return undefined;
      return { type: "e", code: "source", fullName, msg: `${label}は有効な値を設定してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
