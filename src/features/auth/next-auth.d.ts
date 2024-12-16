import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
  }

  interface User {
    email: string;
    state: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
  }
}
