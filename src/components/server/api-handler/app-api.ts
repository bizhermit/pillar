import { NextResponse, type NextRequest } from "next/server";

export const apiMethodHandler = <
  Req extends Array<DataItem.$object> = Array<DataItem.$object>,
  Res extends { [v: string]: any } | void = void
>(process: (context: {
  req: NextRequest;
  getData: (dataItems: Req) => DataItem.Props<Req>;
}) => Promise<Res>) => {
  return async (req: NextRequest, { params }: { params: { [v: string]: string | Array<string> } }) => {
    return NextResponse.json({
    }, { status: 200 });
  };
};
