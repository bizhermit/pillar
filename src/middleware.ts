import { NextRequest } from "next/server";
import { auth } from "./auth";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
};

export const middleware = auth(async (req: NextRequest) => {
  console.log(req.nextUrl);
});
