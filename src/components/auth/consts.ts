import { $str } from "../data-items/string";

export const signInPageUrl: PagePath = "/sign-in";

export const authErrorCallbackUrlQueryName = "callbackUrl";

export const signIn_email = $str({
  name: "email",
  label: "メールアドレス",
  required: true,
  inputMode: "email",
});

export const signIn_password = $str({
  name: "password",
  label: "パスワード",
  required: true,
  inputMode: "url",
});
