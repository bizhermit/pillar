import { isAlphabet, isEmpty, isFullWidth, isFWAlphabet, isFWKatakana, isFWNumeric, isHalfWidth, isHiragana, isHWAlphabet, isHWAlphanumeric, isHWAlphanumericAndSymbols, isHWKatakana, isHWNumeric, isInteger, isKatakana, isMailAddress, isNumeric, isPhoneNumber, isUrl, strLength } from "../../objects/string";
import { getDataItemLabel } from "../label";

export const $strValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$str>, skipSourceCheck?: boolean): Array<DataItem.Validation<DataItem.$str>> => {
  const validations: Array<DataItem.Validation<DataItem.$str>> = [];
  const s = getDataItemLabel({ dataItem, env });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (!isEmpty(p.value)) return undefined;
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", {
          s,
          mode: dataItem.source ? "select" : "input",
        }),
      };
    });
  }

  if (dataItem.length != null) {
    validations.push(({ value, fullName }) => {
      if (isEmpty(value)) return undefined;
      const cur = strLength(value);
      if (cur === dataItem.length) return undefined;
      return {
        type: "e",
        code: "length",
        fullName,
        msg: env.lang("validation.length", {
          s,
          len: dataItem.length,
          cur,
        }),
      };
    });
  } else {
    if (dataItem.minLength != null && dataItem.maxLength != null) {
      validations.push(({ value, fullName }) => {
        if (isEmpty(value)) return undefined;
        const cur = strLength(value);
        if (dataItem.minLength! <= cur && cur <= dataItem.maxLength!) return undefined;
        return {
          type: "e",
          code: "range",
          fullName,
          msg: env.lang("validation.rangeLength", {
            s,
            minLen: dataItem.minLength,
            maxLen: dataItem.maxLength,
            cur,
          }),
        };
      });
    } else {
      if (dataItem.minLength != null) {
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          const cur = strLength(value);
          if (dataItem.minLength! <= cur) return undefined;
          return {
            type: "e",
            code: "minLength",
            fullName,
            msg: env.lang("validation.minLength", {
              s,
              minLen: dataItem.minLength,
              cur,
            }),
          };
        });
      }
      if (dataItem.maxLength != null) {
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          const cur = strLength(value);
          if (cur <= dataItem.maxLength!) return undefined;
          return {
            type: "e",
            code: "maxLength",
            fullName,
            msg: env.lang("validation.maxLength", {
              s,
              maxLen: dataItem.maxLength,
              cur,
            }),
          };
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
          return {
            type: "e",
            code: "int",
            fullName,
            msg: env.lang("validation.int", { s }),
          };
        });
        break;
      case "h-num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWNumeric(value)) return undefined;
          return {
            type: "e",
            code: "h-num",
            fullName,
            msg: env.lang("validation.halfNum", { s }),
          };
        });
        break;
      case "f-num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFWNumeric(value)) return undefined;
          return {
            type: "e",
            code: "f-num",
            fullName,
            msg: env.lang("validation.fullNum", { s }),
          };
        });
        break;
      case "num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isNumeric(value)) return undefined;
          return {
            type: "e",
            code: "num",
            fullName,
            msg: env.lang("validation.num", { s }),
          };
        });
        break;
      case "h-alpha":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphabet(value)) return undefined;
          return {
            type: "e",
            code: "h-alpha",
            fullName,
            msg: env.lang("validation.halfAlpha", { s }),
          };
        });
        break;
      case "f-alpha":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFWAlphabet(value)) return undefined;
          return {
            type: "e",
            code: "f-alpha",
            fullName,
            msg: env.lang("validation.fullAlpha", { s }),
          };
        });
        break;
      case "alpha":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isAlphabet(value)) return undefined;
          return {
            type: "e",
            code: "alpha",
            fullName,
            msg: env.lang("validation.alpha", { s }),
          };
        });
        break;
      case "h-alpha-num":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphanumeric(value)) return undefined;
          return {
            type: "e",
            code: "h-alpha-num",
            fullName,
            msg: env.lang("validation.halfAlphaNum", { s }),
          };
        });
        break;
      case "h-alpha-num-syn":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWAlphanumericAndSymbols(value)) return undefined;
          return {
            type: "e",
            code: "h-alpha-num-syn",
            fullName,
            msg: env.lang("validation.halfApphaNumSyn", { s }),
          };
        });
        break;
      case "h-katanaka":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHWKatakana(value)) return undefined;
          return {
            type: "e",
            code: "h-katakana",
            fullName,
            msg: env.lang("validation.halfKatakana", { s }),
          };
        });
        break;
      case "f-katakana":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFWKatakana(value)) return undefined;
          return {
            type: "e",
            code: "f-katakana",
            fullName,
            msg: env.lang("validation.fullKatakana", { s }),
          };
        });
        break;
      case "katakana":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isKatakana(value)) return undefined;
          return {
            type: "e",
            code: "katakana",
            fullName,
            msg: env.lang("validation.katakana", { s }),
          };
        });
        break;
      case "hiragana":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHiragana(value)) return undefined;
          return {
            type: "e",
            code: "hiragana",
            fullName,
            msg: env.lang("validation.hiragana", { s }),
          };
        });
        break;
      case "half":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isHalfWidth(value)) return undefined;
          return {
            type: "e",
            code: "half",
            fullName,
            msg: env.lang("validation.halfWidth", { s }),
          };
        });
        break;
      case "full":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isFullWidth(value)) return undefined;
          return {
            type: "e",
            code: "full",
            fullName,
            msg: env.lang("validation.fullWidth", { s }),
          };
        });
        break;
      case "email":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isMailAddress(value)) return undefined;
          return {
            type: "e",
            code: "email",
            fullName,
            msg: env.lang("validation.email", { s }),
          };
        });
        break;
      case "tel":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isPhoneNumber(value)) return undefined;
          return {
            type: "e",
            code: "tel",
            fullName,
            msg: env.lang("validation.tel", { s }),
          };
        });
        break;
      case "url":
        validations.push(({ value, fullName }) => {
          if (isEmpty(value)) return undefined;
          if (isUrl(value)) return undefined;
          return {
            type: "e",
            code: "url",
            fullName,
            msg: env.lang("validation.url", { s }),
          };
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
      return {
        type: "e",
        code: "source",
        fullName,
        msg: env.lang("validation.contain", { s }),
      };
    });
  }

  if (dataItem.validations) {
    validations.push(...dataItem.validations);
  }

  return validations;
};
