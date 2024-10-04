import { langLoadLogAtClient } from "../utilities";

const kind = "auth";

langLoadLogAtClient("ja", kind);

const LangAuth = {
  authError: "認証エラー",
  signIn: "サインインしてください。",
  mailAddress: "メールアドレス",
  password: "パスワード",
  signInBtn: "サインイン",
  signOutBtn: "サインアウト",
} as const satisfies I18N_Langs[typeof kind];

export default LangAuth;
