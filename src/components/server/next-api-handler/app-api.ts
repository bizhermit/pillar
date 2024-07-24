import { NextResponse, type NextRequest } from "next/server";
import { $arrayValidations } from "../../data-items/array/validation";
import { $boolParse } from "../../data-items/bool/parse";
import { $boolValidations } from "../../data-items/bool/validation";
import { $dateParse } from "../../data-items/date/parse";
import { $dateValidations } from "../../data-items/date/validation";
import { $fileParse } from "../../data-items/file/parse";
import { $fileValidation } from "../../data-items/file/validation";
import { $numParse } from "../../data-items/number/parse";
import { $numValidations } from "../../data-items/number/validation";
import { $strParse } from "../../data-items/string/parse";
import { $strValidations } from "../../data-items/string/validation";
import { $structValidations } from "../../data-items/struct/validation";
import { $timeParse } from "../../data-items/time/parse";
import { $timeValidations } from "../../data-items/time/validation";
import { getObjectType } from "../../objects";
import { appendValue, getValue, setValue } from "../../objects/struct";

export class ApiError extends Error {

  public apiErrorMessage: Api.Message | undefined;

  public responseData: { [v: string]: any } | null | undefined;

  constructor(public status: number, message?: Api.Message, responseData?: { [v: string]: any } | null | undefined) {
    super(message?.title || message?.body);
    this.apiErrorMessage = message;
    this.responseData = responseData;
  }

}

const convertParams = (params: { [v: string]: any } | Array<any>, dataItems: Array<DataItem.$object> | Readonly<Array<DataItem.$object>>, parentName?: string) => {
  const results: Array<DataItem.ValidationResult> = [];

  const hasError = () => results.some(r => r.type === "e");

  const getDataName = (dataItem: DataItem.$object, index?: number) => {
    return index == null ? dataItem.name : `${dataItem.name}.${index}`;
  };

  const replace = <D extends DataItem.$object>(dataItem: D, parse: (parseProps: DataItem.ParseProps<D>) => DataItem.ParseResult<any>, index: number | undefined): { value: (DataItem.ValueType<D> | null | undefined); name: string; } => {
    const name = getDataName(dataItem, index);
    const value = getValue(params, name)[0];
    const props = {
      value,
      dataItem,
      fullName: parentName ? `${parentName}.${name}` : name,
      data: params,
    } as const satisfies DataItem.ParseProps<D>;
    const [v, r] = parse(props);
    setValue(params, name, v);
    if (r) results.push(r);
    return { value: v, name };
  };

  const impl = (dataItem: DataItem.$object, index?: number) => {
    switch (dataItem.type) {
      case "str":
        replace(dataItem, p => $strParse(p), index);
        return;
      case "num":
        replace(dataItem, p => $numParse(p), index);
        return;
      case "bool":
      case "b-num":
      case "b-str":
        replace(dataItem, p => $boolParse(p), index);
        return;
      case "date":
      case "month":
        replace(dataItem, p => $dateParse(p), index);
        return;
      case "time":
        replace(dataItem, p => $timeParse(p), index);
        return;
      case "file":
        replace(dataItem, p => $fileParse(p), index);
        return;
      case "array": {
        const { value, name } = replace(dataItem, ({ value, fullName }) => {
          if (value == null || getObjectType(value) === "Array") return [value];
          return [undefined, { type: "e", code: "parse", fullName, msg: `${dataItem.label}に配列を設定してください。` }];
        }, index);
        if (!hasError() && value) {
          const item = dataItem.item;
          if (Array.isArray(item)) {
            results.push(...convertParams(value, item, name));
          } else {
            switch (item.type) {
              case "struct":
                results.push(...convertParams(value, item, name));
                break;
              default:
                value.forEach((_, i) => {
                  impl(dataItem, i);
                });
                break;
            }
          }
        }
        return;
      }
      case "struct": {
        const { value, name } = replace(dataItem, ({ value, fullName }) => {
          if (value == null || getObjectType(value) === "Object") return [value];
          return [undefined, { type: "e", code: "parse", fullName, msg: `${dataItem.label}に連想配列を設定してください。` }];
        }, index);
        if (!hasError() && value) results.push(...convertParams(value, dataItem.item, name));
        return;
      }
      default:
        return;
    }
  };

  dataItems.forEach(dataItem => {
    impl(dataItem);
  });

  return results;
};

const validationParams = (params: { [v: string]: any } | Array<any>, dataItems: Array<DataItem.$object> | Readonly<Array<DataItem.$object>>, parentName?: string) => {
  const results: Array<DataItem.ValidationResult> = [];

  const getDataName = (dataItem: DataItem.$object, index?: number) => {
    return index == null ? dataItem.name : `${dataItem.name}.${index}`;
  };

  const isValid = <D extends DataItem.$object>(dataItem: D, validations: Array<DataItem.Validation<any>>, index: number | undefined): { ok: boolean; value: DataItem.ValueType<D>; name: string; } => {
    const name = getDataName(dataItem, index);
    const value = getValue(params, name)[0];

    let r: DataItem.ValidationResult | null | undefined;
    for (const func of validations) {
      r = func({
        value,
        data: params,
        dataItem: dataItem,
        siblings: dataItems,
        fullName: parentName ? `${parentName}.${name}` : name,
      });
      if (r) {
        results.push(r);
        return { ok: false, value, name };
      }
    }
    return { ok: true, value, name };
  };

  const impl = (dataItem: DataItem.$object, index?: number) => {
    switch (dataItem.type) {
      case "str":
        isValid(dataItem, $strValidations(dataItem), index);
        return;
      case "num":
        isValid(dataItem, $numValidations(dataItem), index);
        return;
      case "bool":
      case "b-num":
      case "b-str":
        isValid(dataItem, $boolValidations(dataItem), index);
        return;
      case "date":
      case "month":
        isValid(dataItem, $dateValidations(dataItem), index);
        return;
      case "time":
        isValid(dataItem, $timeValidations(dataItem), index);
        return;
      case "file":
        isValid(dataItem, $fileValidation(dataItem), index);
        return;
      case "array": {
        const { value, name } = isValid(dataItem, $arrayValidations(dataItem), index);
        if (value) {
          const item = dataItem.item;
          if (Array.isArray(item)) {
            results.push(...validationParams(value, item, name));
          } else {
            switch (item.type) {
              case "struct":
                results.push(...validationParams(value, item, name));
                break;
              default:
                value.forEach((_, i) => {
                  impl(dataItem, i);
                });
                break;
            }
          }
        }
        return;
      }
      case "struct": {
        const { value, name } = isValid(dataItem, $structValidations(dataItem), index);
        if (value) results.push(...validationParams(value, dataItem.item, name));
        return;
      }
      default:
        return;
    }
  };

  dataItems.forEach(dataItem => {
    impl(dataItem);
  });

  return results;
};

export const apiMethodHandler = <
  Req extends Array<DataItem.$object> = Array<DataItem.$object>,
  Res extends { [v: string]: any } | void = void
>(process?: (context: {
  req: NextRequest;
  getParams: (dataItems: Req) => Promise<DataItem.Props<Req>>;
  addValidationResults: (results: Array<DataItem.ValidationResult>) => void;
  hasValidationError: () => boolean;
  throwIfHasValidationError: () => void;
}) => Promise<Res>) => {
  return async (req: NextRequest, { params }: { params: { [v: string]: string | Array<string> } }) => {
    if (process == null) {
      return NextResponse.json({}, { status: 404 });
    }

    let status: number | undefined;
    let message: Api.Message | undefined;
    const method = req.method.toLowerCase() as Api.Methods;

    const validationResults: Array<DataItem.ValidationResult> = [];

    try {
      const data = await process({
        req,
        getParams: async (dataItems) => {
          const { searchParams } = new URL(req.url);
          const queryParams: { [v: string]: any } = {};
          searchParams.forEach((value, key) => {
            appendValue(queryParams, key, value);
          });

          let bodyParams: { [v: string]: any } = {};
          if (method !== "get") {
            const contentType = req.headers.get("content-type") ?? "";
            if (/application\/json/.test(contentType)) {
              bodyParams = await req.json();
            } else {
              const formData = await req.formData();
              formData.forEach((value, key) => {
                appendValue(bodyParams, key, value);
              });
            }
          }

          const p = {
            ...queryParams,
            ...params,
            ...bodyParams,
          };

          validationResults.push(...convertParams(p, dataItems));
          validationResults.push(...validationParams(p, dataItems));

          return p as DataItem.Props<Req>;
        },
        addValidationResults: (results) => {
          validationResults.push(...results.filter(item => item != null));
        },
        hasValidationError: () => {
          return validationResults.some(item => item.type === "e");
        },
        throwIfHasValidationError: () => {
          const nameBuf = new Set<string>([]);
          const validationError = validationResults.filter(item => {
            if (nameBuf.has(item.fullName)) return false;
            if (item.type !== "e") return false;
            nameBuf.add(item.fullName);
            return true;
          });
          if (validationError.length === 0) return;
          throw new ApiError(422, {
            type: "e",
            title: "バリデーションエラー",
            body: validationError.map(item => item.msg).join("\n"),
          }, { validationResults });
        },
      });

      return NextResponse.json({ message, data }, { status: status ?? 200 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      let data: { [v: string]: any } | null | undefined;
      if (err instanceof ApiError) {
        status = err.status;
        message = err.apiErrorMessage;
        data = err.responseData;
      }
      return NextResponse.json({
        message: message ?? {
          type: "e",
          title: "Server Error",
        } as const satisfies Api.Message,
        data,
      }, { status: status ?? 500 });
    }
  };
};
