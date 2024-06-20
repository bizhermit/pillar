import { isEmpty } from "../../objects/string";

const defaultLabel = "値";

export const $strValidations = (dataItem: DataItem.$str): Array<DataItem.Validation<DataItem.$str>> => {
  const validations: Array<DataItem.Validation<DataItem.$str>> = [];

  if (dataItem.required) {
    validations.push(({ value }) => {
      if (isEmpty(value)) return { type: "e", code: "required", msg: `${dataItem.label || defaultLabel}を入力してください。` };
      return undefined;
    });
  }

  if (dataItem.length != null) {
    // TODO
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      // TODO
    } else {
      if (dataItem.minLength != null) {
        // TODO
      }
      if (dataItem.maxLength != null) {
        // TODO
      }
    }
  }

  if (dataItem.charType) {
    // TODO
    switch (dataItem.charType) {
      case "int":
        break;
    }
  }

  if (dataItem.source) {
    // TODO
    validations.push(({ value, self }) => {
      if (isEmpty(value)) return undefined;
      if (dataItem.source!.find(s => s.id === value)) return undefined;
      return { type: "e", code: "source", msg: `${dataItem.label || defaultLabel}は選択肢に存在しません。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
