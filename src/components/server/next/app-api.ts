import { NextResponse, type NextRequest } from "next/server";
import { parseBasedOnDataItem } from "../../data-items/parse";
import { validationBasedOnDataItem } from "../../data-items/validation";
import { append } from "../../objects/struct";

export class ApiError extends Error {

  public apiErrorMessage: Api.Message | undefined;

  public responseData: { [v: string]: any } | null | undefined;

  constructor(public status: number, message?: Api.Message, responseData?: { [v: string]: any } | null | undefined) {
    super(message?.title || message?.body);
    this.apiErrorMessage = message;
    this.responseData = responseData;
  }

}

export const apiMethodHandler = <
  Req extends Readonlyable<Array<DataItem.$object>>,
  Res extends Readonlyable<{ [v: string]: any }> | void
>(process: (context: {
  req: NextRequest;
  tzOffset: number;
  getParams: <$Req extends Readonlyable<Array<DataItem.$object>> = Req>(dataItems: $Req) => Promise<DataItem.Props<$Req>>;
  addValidationResults: (results: Array<DataItem.ValidationResult>) => void;
  hasValidationError: () => boolean;
  throwIfHasValidationError: () => void;
}) => Promise<Res>) => {
  return (async (req, { params }) => {
    if (process == null) {
      return NextResponse.json({}, { status: 404 });
    }

    let status: number | undefined;
    let message: Api.Message | undefined;
    const method = req.method.toLowerCase() as Api.Methods;

    const validationResults: Array<DataItem.ValidationResult> = [];

    try {
      const tzOffset = Number(req.headers.get("tz-offset") || new Date().getTimezoneOffset());
      const data = await process({
        req,
        tzOffset,
        getParams: async (dataItems) => {
          const { searchParams } = new URL(req.url);
          const queryParams: { [v: string]: any } = {};
          searchParams.forEach((value, key) => {
            append(queryParams, key, value);
          });

          let bodyParams: { [v: string]: any } = {};
          if (method !== "get") {
            const contentType = req.headers.get("content-type") ?? "";
            if (/application\/json/.test(contentType)) {
              bodyParams = await req.json();
            } else {
              const formData = await req.formData();
              formData.forEach((value, key) => {
                append(bodyParams, key, value);
              });
            }
          }

          const p = {
            ...queryParams,
            ...params,
            ...bodyParams,
          };

          validationResults.push(...parseBasedOnDataItem(p, dataItems));
          validationResults.push(...validationBasedOnDataItem(p, dataItems));

          return p as DataItem.Props<typeof dataItems>;
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
            buttonText: "閉じる",
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
  }) as {
    (req: NextRequest, arg: { params: { [v: string]: string | Array<string> } }): Promise<NextResponse<any>>;
    req: DataItem.Props<Req>;
    res: Res;
  };
};
