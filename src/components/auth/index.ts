import { LANG_KEY } from "@/i18n/consts";
import { analyzeHeaderAcceptLang } from "@/i18n/utilities";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { isEmpty } from "../objects";
import { authErrorCallbackUrlQueryName, signIn_email, signIn_password, signInPageUrl } from "./consts";

const isDev = /^dev/.test(process.env.NODE_ENV);

export const {
  auth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  debug: isDev,
  trustHost: true,
  pages: {
    signIn: signInPageUrl,
  },
  // adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 1, // NOTE: 1 day
  },
  providers: [
    Credentials({
      name: "signin",
      credentials: {
        [signIn_email.name]: {
          label: signIn_email.label,
          type: "email",
        },
        [signIn_password.name]: {
          label: signIn_password.label,
          type: "password",
        },
      },
      authorize: async ({ email, password }) => {
        if (isEmpty(password)) return null;
        return {
          id: "0",
          email: email as string,
          name: "test user",
          state: "0",
        };
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl, cookies, headers } }) => {
      const res = NextResponse.next();
      if (!cookies.get(LANG_KEY)) {
        const lang = analyzeHeaderAcceptLang(headers.get("accept-language"));
        cookies.set(LANG_KEY, lang);
        res.cookies.set({
          name: LANG_KEY,
          value: lang,
          path: "/",
          sameSite: "lax",
        });
      }
      if (/^(\/|\/api|\/api\/auth\/.*)$/.test(nextUrl.pathname) || /^\/(sign-in|sandbox)(\/|$)/.test(nextUrl.pathname)) return res;
      if (auth?.user != null) return res;
      const url = new URL(signInPageUrl, nextUrl);
      url.searchParams.set(authErrorCallbackUrlQueryName, nextUrl.href);
      if (/.*\/api(\/|$)/.test(nextUrl.pathname)) return NextResponse.json({
        message: {
          type: "e",
          title: "認証エラー",
          body: "サインインしてください。",
        } as const satisfies Api.Message,
      }, { status: 401 });
      return NextResponse.redirect(url);
    },
  },
  events: {
    signIn: async () => {
    },
    signOut: async () => {
    },
    updateUser: async () => {
    },
  },
  logger: {
    error: () => {
    },
  },
});
