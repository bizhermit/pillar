import { NextResponse, type NextRequest } from "next/server";
import { appendValue } from "../../objects/struct";

export class ApiError extends Error {

  public apiErrorMessage: Api.Message | undefined;

  constructor(public status: number, message?: Api.Message) {
    super(message?.title || message?.body);
    this.apiErrorMessage = message;
  }

}

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

          // TODO: parse data
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
