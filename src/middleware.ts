import { auth } from "@/auth";
import { LANG_KEY } from "@/i18n/consts";
import { analyzeHeaderAcceptLang } from "@/i18n/utilities";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};

export const middleware = auth((req) => {
  const res = NextResponse.next();
  if (!req.cookies.get(LANG_KEY)) {
    const lang = analyzeHeaderAcceptLang(req.headers.get("accept-language"));
    req.cookies.set(LANG_KEY, lang);
    res.cookies.set({
      name: LANG_KEY,
      value: lang,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
});
