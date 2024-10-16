import { langLoadLogAtClient } from "@/i18n/utilities";

const kind = "auth";

langLoadLogAtClient("en", kind);

const Langs = {
  authError: "Authentication error",
  signIn: "Please sign in.",
  mailAddress: "Mail Address",
  password: "Password",
  signInBtn: "SignIn",
  signOutBtn: "SignOut",
} as const satisfies Partial<I18N_Langs[typeof kind]>;

export default Langs;
