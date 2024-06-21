import { getFloatPosition } from "../../objects/number";

const defaultLabel = "値";

export const $numValidations = (dataItem: DataItem.$num): Array<DataItem.Validation<DataItem.$num>> => {
  const validations: Array<DataItem.Validation<DataItem.$num>> = [];

  const label = dataItem.label || defaultLabel;

  if (dataItem.required) {
    validations.push(({ value }) => {
      if (value == null) return undefined;
      return { type: "e", code: "required", msg: `${label}を入力してください。` };
    });
  }

  if (dataItem.min != null && dataItem.max != null) {
    validations.push(({ value }) => {
      if (value == null) return undefined;
      if (dataItem.min! <= value && value <= dataItem.max!) return undefined;
      return { type: "e", code: "range", msg: `${label}は${dataItem.min}以上${dataItem.max}以下で入力してください。` };
    });
  } else {
    if (dataItem.min != null) {
      validations.push(({ value }) => {
        if (value == null) return undefined;
        if (dataItem.min! <= value) return undefined;
        return { type: "e", code: "min", msg: `${label}は${dataItem.min}以上で入力してください。` };
      });
    }
    if (dataItem.max != null) {
      validations.push(({ value }) => {
        if (value == null) return undefined;
        if (value <= dataItem.max!) return undefined;
        return { type: "e", code: "max", msg: `${label}は${dataItem.max}以下で入力してください。` };
      });
    }
  }

  if (dataItem.float != null) {
    validations.push(({ value }) => {
      if (value == null) return undefined;
      const fp = getFloatPosition(value);
      if (fp <= dataItem.float!) return undefined;
      return { type: "e", code: "float", msg: `${label}は少数第${dataItem.float}位までで入力してください。[${fp}]`};
    });
  }

  if (dataItem.source) {
    validations.push(({ value }) => {
      if (value == null) return undefined;
      if (dataItem.source!.find(s => s.id === value)) return undefined;
      return { type: "e", code: "source", msg: `${label}は有効な値を設定してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
