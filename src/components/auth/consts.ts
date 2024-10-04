import { langFactory } from "@/i18n/factory";
import { $str } from "../data-items/string";

export const signInPageUrl: PagePath = "/sign-in";

export const authErrorCallbackUrlQueryName = "callbackUrl";

const lang = langFactory();

export const signIn_email = $str({
  name: "email",
  label: lang("auth.mailAddress"),
  required: true,
  inputMode: "email",
});

export const signIn_password = $str({
  name: "password",
  label: lang("auth.password"),
  required: true,
  inputMode: "url",
});
