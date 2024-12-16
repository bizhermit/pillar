import { $str } from "@/data-items/string";

export const signInPageUrl: PagePath = "/sign-in";

export const authErrorCallbackUrlQueryName = "callbackUrl";

export const signIn_email = $str({
  name: "email",
  label: "auth.mailAddress",
  required: true,
  inputMode: "email",
});

export const signIn_password = $str({
  name: "password",
  label: "auth.password",
  required: true,
  inputMode: "url",
});
