import { type RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse, type NextRequest } from "next/server";
import getSession from "../../auth/session";
import { setValue } from "../../objects/struct/set";
import { acceptData, getReturnMessages, hasError } from "./main";

type MethodProcess<Req extends Api.RequestDataItems = Api.RequestDataItems, Res extends { [v: string]: any } | void = void> =
  (context: {
    req: NextRequest;
    user: SignInUser | undefined;
    getCookies: () => RequestCookies;
    setStatus: (code: number) => void;
    hasError: () => boolean;
    getData: () => DI.VType<Req, true, "app-api">;
  }) => Promise<Res>;

const apiMethodHandler = <
  Req extends Api.RequestDataItems = Api.RequestDataItems,
  Res extends { [v: string]: any } | void = void
>(props: {
  dataItems?: Readonly<Req | null>;
  process?: MethodProcess<Req, Res> | null;
}) => {
  return (async (req: NextRequest, { params }) => {
    if (props.process == null) {
      return NextResponse.json({}, { status: 404 });
    }

    let statusCode: number | undefined = undefined;
    const msgs: Array<Api.Message> = [];
    const method = (req.method.toLowerCase() ?? "get") as Api.Methods;

    try {
      const session = await getSession();

      const reqData = await (async () => {
        const data = await (async () => {
          const { searchParams } = new URL(req.url);
          const queryData: { [v: string]: any } = {};
          Array.from(searchParams.keys()).forEach(key => {
            setValue(queryData, key, searchParams.get(key));
          });
          if (method === "get") {
            return {
              ...queryData,
              ...params,
            };
          }
          const contentType = req.headers.get("content-type") ?? "";
          if (/application\/json/.test(contentType)) {
            return {
              ...queryData,
              ...params,
              ...(await req.json()),
            };
          }
          const data: { [v: string]: any } = {
            ...queryData,
            ...params,
          };
          const formData = await req.formData();
          Array.from(formData.keys()).forEach(key => {
            setValue(data, key, formData.get(key));
          });
          return data;
        })();
        if (props.dataItems == null) return data;
        acceptData(msgs, data, props.dataItems);
        return data;
      })();

      if (hasError(msgs)) {
        statusCode = 422;
        throw new Error("validation error");
      }

      const resData = await props.process({
        req,
        user: session?.user,
        getCookies: () => req.cookies,
        setStatus: (code: number) => statusCode = code,
        hasError: () => hasError(msgs),
        getData: () => reqData as any,
      });

      return NextResponse.json({
        messages: getReturnMessages(msgs),
        data: resData,
      }, {
        status: statusCode ?? resData == null ? 204 : 200,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      return NextResponse.json({
        messages: getReturnMessages(msgs),
      }, {
        status: statusCode ?? 500,
      });
    }
  }) as {
    (req: NextRequest, ctx: { params: { [v: string]: string | Array<string> } }): Promise<NextResponse>;
    req: DI.VType<Req, false, "client">;
    res: Res;
  };
};

export default apiMethodHandler;
