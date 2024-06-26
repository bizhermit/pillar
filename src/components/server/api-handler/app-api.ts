import { $dateParse } from "@/data-items/date/parse";
import { $fileParse } from "@/data-items/file/parse";
import { $numParse } from "@/data-items/number/parse";
import { $strParse } from "@/data-items/string/parse";
import { $timeParse } from "@/data-items/time/parse";
import { getObjectType } from "@/objects";
import { NextResponse, type NextRequest } from "next/server";
import { $boolParse } from "../../data-items/bool/parse";
import { appendValue, getValue, setValue } from "../../objects/struct";

export class ApiError extends Error {

  public apiErrorMessage: Api.Message | undefined;

  constructor(public status: number, message?: Api.Message) {
    super(message?.title || message?.body);
    this.apiErrorMessage = message;
  }

}

const convertParams = (params: { [v: string]: any } | Array<any>, dataItems: Array<DataItem.$object> | Readonly<Array<DataItem.$object>>) => {
  const parseResults: Array<DataItem.ValidationResult> = [];

  const hasError = () => parseResults.some(r => r.type === "e");

  const getDataName = (dataItem: DataItem.$object, index?: number) => {
    return index == null ? dataItem.name : `${dataItem.name}.${index}`;
  };

  const replace = <D extends DataItem.$object>(dataItem: D, parse: (value: any) => DataItem.ParseResult<any>, index?: number): (DataItem.ValueType<D> | null | undefined) => {
    const name = getDataName(dataItem, index);
    const [v, r] = parse(getValue(params, name));
    setValue(params, name, v);
    if (r) parseResults.push(r);
    return v;
  };

  const impl = (dataItem: DataItem.$object, index?: number) => {
    if ("trueValue" in dataItem) {
      replace(dataItem, v => $boolParse(v, dataItem), index);
      return;
    }

    switch (dataItem.type) {
      case "str":
        replace(dataItem, v => $strParse(v, dataItem));
        return;
      case "num":
        replace(dataItem, v => $numParse(v, dataItem));
        return;
      case "date":
      case "month":
        replace(dataItem, v => $dateParse(v, dataItem));
        return;
      case "time":
        replace(dataItem, v => $timeParse(v, dataItem));
        break;
      case "file":
        replace(dataItem, v => $fileParse(v, dataItem));
        return;
      case "array":
        const value = replace(dataItem, v => {
          if (v == null || getObjectType(v) === "Array") return [v];
          return [undefined, { type: "e", code: "parse", msg: `${dataItem.label}に配列を設定してください。` }];
        });
        if (!hasError() && value) {
          const item = dataItem.item;
          if (Array.isArray(item)) {
            const results = convertParams(value, item);
            parseResults.push(...results);
          } else {
            switch (item.type) {
              case "struct":
                const results = convertParams(value, item);
                parseResults.push(...results);
                break;
              default:
                value.forEach((_, i) => {
                  impl(dataItem, i);
                });
                break;
            }
          }
        }
        break;
      case "struct":
        replace(dataItem, v => {
          if (v == null || getObjectType(v) === "Object") return [v];
          return [undefined, { type: "e", code: "parse", msg: `${dataItem.label}に連想配列を設定してください。` }];
        });
        if (!hasError()) {
          convertParams(getValue(params, dataItem.name) as { [v: string]: any }, dataItem.item);
        }
        break;
      default:
        return;
    }
  };

  dataItems.forEach(dataItem => {
    impl(dataItem);
  });

  return parseResults;
};

export const apiMethodHandler = <
  Req extends Array<DataItem.$object> = Array<DataItem.$object>,
  Res extends { [v: string]: any } | void = void
>(process?: (context: {
  req: NextRequest;
  getParams: (dataItems: Req) => Promise<DataItem.Props<Req>>;
}) => Promise<Res>) => {
  return async (req: NextRequest, { params }: { params: { [v: string]: string | Array<string> } }) => {
    if (process == null) {
      return NextResponse.json({}, { status: 404 });
    }

    let status: number | undefined;
    let message: Api.Message | undefined;
    const method = req.method.toLowerCase() as Api.Methods;

    try {
      const data = await process({
        req,
        getParams: async (dataItems) => {
          const { searchParams } = new URL(req.url);
          const queryParams: { [v: string]: any } = {};
          Array.from(searchParams.keys()).forEach(key => {
            appendValue(queryParams, key, searchParams.get(key));
          });

          let bodyParams: { [v: string]: any } = {};
          if (method !== "get") {
            const contentType = req.headers.get("content-type") ?? "";
            if (/application\/json/.test(contentType)) {
              bodyParams = await req.json();
            } else {
              const formData = await req.formData();
              Array.from(formData.keys()).forEach(key => {
                appendValue(bodyParams, key, formData.get(key));
              });
            }
          }

          const p = {
            ...queryParams,
            ...params,
            ...bodyParams,
          };

          convertParams(p, dataItems);
          // TODO: validation

          return p as DataItem.Props<Req>;
        },
      });

      return NextResponse.json({ message, data }, { status: status ?? 200 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err instanceof ApiError) {
        status = err.status;
        message = err.apiErrorMessage;
      }
      return NextResponse.json({
        message: message ?? {
          type: "e",
          title: "Server Error",
        } as const satisfies Api.Message,
      }, { status: status ?? 500 });
    }
  };
};
