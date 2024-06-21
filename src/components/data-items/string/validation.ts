import { isAlphabet, isEmpty, isFullWidth, isFWAlphabet, isFWKatakana, isFWNumeric, isHalfWidth, isHiragana, isHWAlphabet, isHWAlphanumeric, isHWAlphanumericAndSymbols, isHWKatakana, isHWNumeric, isInteger, isKatakana, isMailAddress, isNumeric, isPhoneNumber, isUrl, strLength } from "../../objects/string";

const defaultLabel = "値";

export const $strValidations = (dataItem: DataItem.$str): Array<DataItem.Validation<DataItem.$str>> => {
  const validations: Array<DataItem.Validation<DataItem.$str>> = [];

  const label = dataItem.label || defaultLabel;

  if (dataItem.required) {
    validations.push(({ value }) => {
      if (!isEmpty(value)) return undefined;
      return { type: "e", code: "required", msg: `${label}を入力してください。` };
    });
  }

  if (dataItem.length != null) {
    validations.push(({ value }) => {
      if (isEmpty(value)) return undefined;
      if (strLength(value) === dataItem.length) return undefined;
      return { type: "e", code: "length", msg: `${label}は${dataItem.length}文字で入力してください。` };
    });
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      validations.push(({ value }) => {
        if (isEmpty(value)) return undefined;
        const len = strLength(value);
        if (dataItem.minLength! <= len && len <= dataItem.maxLength!) return undefined;
        return { type: "e", code: "range", msg: `${label}は${dataItem.minLength}文字以上${dataItem.maxLength}文字以下で入力してください。（現在：${len}）` };
      });
    } else {
      if (dataItem.minLength != null) {
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          const len = strLength(value);
          if (dataItem.minLength! <= len) return undefined;
          return { type: "e", code: "minLength", msg: `${label}は${dataItem.minLength}文字以上で入力してください。（現在：${len}）` };
        });
      }
      if (dataItem.maxLength != null) {
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          const len = strLength(value);
          if (len <= dataItem.maxLength!) return undefined;
          return { type: "e", code: "range", msg: `${label}は${dataItem.maxLength}文字以下で入力してください。（現在：${len}）` };
        });
      }
    }
  }

  if (dataItem.charType) {
    switch (dataItem.charType) {
      case "int":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isInteger(value)) return undefined;
          return { type: "e", code: "int", msg: `${label}は数値で入力してください。` };
        });
        break;
      case "h-num":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHWNumeric(value)) return undefined;
          return { type: "e", code: "h-num", msg: `${label}は半角数字で入力してください。` };
        });
        break;
      case "f-num":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isFWNumeric(value)) return undefined;
          return { type: "e", code: "f-num", msg: `${label}は全角数字で入力してください。` };
        });
        break;
      case "num":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isNumeric(value)) return undefined;
          return { type: "e", code: "num", msg: `${label}は数字で入力してください。` };
        });
        break;
      case "h-alpha":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphabet(value)) return undefined;
          return { type: "e", code: "h-alpha", msg: `${label}は半角英字で入力してください。` };
        });
        break;
      case "f-alpha":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isFWAlphabet(value)) return undefined;
          return { type: "e", code: "f-alpha", msg: `${label}は全角英字で入力してください。` };
        });
        break;
      case "alpha":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isAlphabet(value)) return undefined;
          return { type: "e", code: "alpha", msg: `${label}は英字で入力してください。` };
        });
        break;
      case "h-alpha-num":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphanumeric(value)) return undefined;
          return { type: "e", code: "h-alpha-num", msg: `${label}は半角英数字で入力してください。` };
        });
        break;
      case "h-alpha-num-syn":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphanumericAndSymbols(value)) return undefined;
          return { type: "e", code: "h-alpha-num-syn", msg: `${label}は半角英数字記号で入力してください。` };
        });
        break;
      case "h-katanaka":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHWKatakana(value)) return undefined;
          return { type: "e", code: "h-katakana", msg: `${label}は半角カタカナで入力してください。` };
        });
        break;
      case "f-katakana":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isFWKatakana(value)) return undefined;
          return { type: "e", code: "f-katakana", msg: `${label}は全角カタカナで入力してください。` };
        });
        break;
      case "katakana":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isKatakana(value)) return undefined;
          return { type: "e", code: "katakana", msg: `${label}はカタカナで入力してください。` };
        });
        break;
      case "hiragana":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHiragana(value)) return undefined;
          return { type: "e", code: "hiragana", msg: `${label}はひらがなで入力してください。` };
        });
        break;
      case "half":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isHalfWidth(value)) return undefined;
          return { type: "e", code: "half", msg: `${label}は半角で入力してください。` };
        });
        break;
      case "full":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isFullWidth(value)) return undefined;
          return { type: "e", code: "full", msg: `${label}は全角で入力してください。` };
        });
        break;
      case "email":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isMailAddress(value)) return undefined;
          return { type: "e", code: "email", msg: `${label}はメールアドレスを入力してください。` };
        });
        break;
      case "tel":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isPhoneNumber(value)) return undefined;
          return { type: "e", code: "tel", msg: `${label}は電話番号を入力してください。` };
        });
        break;
      case "url":
        validations.push(({ value }) => {
          if (isEmpty(value)) return undefined;
          if (isUrl(value)) return undefined;
          return { type: "e", code: "url", msg: `${label}はURLを入力してください。` };
        });
        break;
      default:
        break;
    }
  }

  if (dataItem.source) {
    validations.push(({ value, self }) => {
      if (isEmpty(value)) return undefined;
      if (dataItem.source!.find(s => s.id === value)) return undefined;
      return { type: "e", code: "source", msg: `${label}は有効な値を設定してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
