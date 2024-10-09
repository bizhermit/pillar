import { auth } from "~/auth";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};

export const middleware = auth;
