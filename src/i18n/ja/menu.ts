import { langLoadLogAtClient } from "@/i18n/utilities";

const kind = "menu";

langLoadLogAtClient("ja", kind);

const Langs = {
  home: "ホーム",
  userSettings: "ユーザー設定",
  calendar: "カレンダー",
  project: "プロジェクト",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
