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
        console.log("signin:", email, password);
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
    authorized: async ({ auth, request: { nextUrl } }) => {
      if (/^(\/|\/api|\/api\/auth\/.*)$/.test(nextUrl.pathname) || /^\/(sign-in|sandbox)(\/|$)/.test(nextUrl.pathname)) return true;
      if (auth?.user != null) return true;
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
