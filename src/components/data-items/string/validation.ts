import { isAlphabet, isEmpty, isFullWidth, isFWAlphabet, isFWKatakana, isFWNumeric, isHalfWidth, isHiragana, isHWAlphabet, isHWAlphanumeric, isHWAlphanumericAndSymbols, isHWKatakana, isHWNumeric, isInteger, isKatakana, isMailAddress, isNumeric, isPhoneNumber, isUrl, strLength } from "../../objects/string";

const defaultLabel = "値";

export const $strValidations = (dataItem: DataItem.ArgObject<DataItem.$str>, skipSourceCheck?: boolean): Array<DataItem.Validation<DataItem.$str>> => {
  const validations: Array<DataItem.Validation<DataItem.$str>> = [];

  const label = dataItem.label || dataItem.name || defaultLabel;

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (!isEmpty(p.value)) return undefined;
      return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を${dataItem.source ? "選択" : "入力"}してください。` };
    });
  }

  if (dataItem.length != null) {
    validations.push(({ value, fullName }) => {
      if (isEmpty(value)) return undefined;
      if (strLength(value) === dataItem.length) return undefined;
      return { type: "e", code: "length", fullName, msg: `${label}は${dataItem.length}文字で入力してください。` };
    });
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      validations.push(({ value, fullName }) => {
        if (isEmpty(value)) return undefined;
        const len = strLength(value);
        if (dataItem.minLength! <= len && len <= dataItem.maxLength!) return undefined;
        return { type: "e", code: "range", fullName, msg: `${label}は${dataItem.minLength}文字以上${dataItem.maxLength}文字以下で入力してください。（現在：${len}）` };
      });
    } else {
      if (dataItem.minLength != null) {
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          const len = strLength(value);
          if (dataItem.minLength! <= len) return undefined;
          return { type: "e", code: "minLength", fullName, msg: `${label}は${dataItem.minLength}文字以上で入力してください。[${len}]` };
        });
      }
      if (dataItem.maxLength != null) {
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          const len = strLength(value);
          if (len <= dataItem.maxLength!) return undefined;
          return { type: "e", code: "maxLength", fullName, msg: `${label}は${dataItem.maxLength}文字以下で入力してください。[${len}]` };
        });
      }
    }
  }

  if (dataItem.charType) {
    switch (dataItem.charType) {
      case "int":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isInteger(value)) return undefined;
          return { type: "e", code: "int", fullName, msg: `${label}は数値で入力してください。` };
        });
        break;
      case "h-num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWNumeric(value)) return undefined;
          return { type: "e", code: "h-num", fullName, msg: `${label}は半角数字で入力してください。` };
        });
        break;
      case "f-num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFWNumeric(value)) return undefined;
          return { type: "e", code: "f-num", fullName, msg: `${label}は全角数字で入力してください。` };
        });
        break;
      case "num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isNumeric(value)) return undefined;
          return { type: "e", code: "num", fullName, msg: `${label}は数字で入力してください。` };
        });
        break;
      case "h-alpha":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphabet(value)) return undefined;
          return { type: "e", code: "h-alpha", fullName, msg: `${label}は半角英字で入力してください。` };
        });
        break;
      case "f-alpha":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFWAlphabet(value)) return undefined;
          return { type: "e", code: "f-alpha", fullName, msg: `${label}は全角英字で入力してください。` };
        });
        break;
      case "alpha":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isAlphabet(value)) return undefined;
          return { type: "e", code: "alpha", fullName, msg: `${label}は英字で入力してください。` };
        });
        break;
      case "h-alpha-num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphanumeric(value)) return undefined;
          return { type: "e", code: "h-alpha-num", fullName, msg: `${label}は半角英数字で入力してください。` };
        });
        break;
      case "h-alpha-num-syn":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphanumericAndSymbols(value)) return undefined;
          return { type: "e", code: "h-alpha-num-syn", fullName, msg: `${label}は半角英数字記号で入力してください。` };
        });
        break;
      case "h-katanaka":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWKatakana(value)) return undefined;
          return { type: "e", code: "h-katakana", fullName, msg: `${label}は半角カタカナで入力してください。` };
        });
        break;
      case "f-katakana":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFWKatakana(value)) return undefined;
          return { type: "e", code: "f-katakana", fullName, msg: `${label}は全角カタカナで入力してください。` };
        });
        break;
      case "katakana":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isKatakana(value)) return undefined;
          return { type: "e", code: "katakana", fullName, msg: `${label}はカタカナで入力してください。` };
        });
        break;
      case "hiragana":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHiragana(value)) return undefined;
          return { type: "e", code: "hiragana", fullName, msg: `${label}はひらがなで入力してください。` };
        });
        break;
      case "half":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHalfWidth(value)) return undefined;
          return { type: "e", code: "half", fullName, msg: `${label}は半角で入力してください。` };
        });
        break;
      case "full":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFullWidth(value)) return undefined;
          return { type: "e", code: "full", fullName, msg: `${label}は全角で入力してください。` };
        });
        break;
      case "email":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isMailAddress(value)) return undefined;
          return { type: "e", code: "email", fullName, msg: `${label}はメールアドレスを入力してください。` };
        });
        break;
      case "tel":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isPhoneNumber(value)) return undefined;
          return { type: "e", code: "tel", fullName, msg: `${label}は電話番号を入力してください。` };
        });
        break;
      case "url":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isUrl(value)) return undefined;
          return { type: "e", code: "url", fullName, msg: `${label}はURLを入力してください。` };
        });
        break;
      default:
        break;
    }
  }

  if (!skipSourceCheck && dataItem.source) {
    validations.push(({ value, fullName }) => {
      if (isEmpty(value)) return undefined;
      if (dataItem.source!.find(s => s.value === value)) return undefined;
      return { type: "e", code: "source", fullName, msg: `${label}は有効な値を設定してください。` };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
