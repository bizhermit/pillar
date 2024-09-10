import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const isDev = /^dev/.test(process.env.NODE_ENV);

const authConfig: NextAuthConfig = {
  debug: isDev,
  pages: {
    signIn: "/sign-in",
    signOut: "sign-out",
  },
  providers: [
    Credentials({
      name: "signin",
      credentials: {
        email: {
          label: "メールアドレス",
          type: "text",
        },
        password: {
          label: "パスワード",
          type: "password",
        },
      },
      authorize: async ({ email, password }, req) => {
        console.log("signin:", email, password);
        return {
          id: "1",
          email: email as string,
          name: "test user",
        };
      },
    }),
  ]
};

export default authConfig;
