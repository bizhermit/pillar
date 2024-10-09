import { langLoadLogAtClient } from "../../components/i18n/utilities";

const kind = "navigation";

langLoadLogAtClient("ja", kind);

const Langs = {
  spreadNav: "メニューを広げる",
  shrinkNav: "メニューを狭める",
  openNav: "メニューを開く",
  closeNav: "メニューを閉じる",
  autoNav: "メニューサイズを自動化",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
