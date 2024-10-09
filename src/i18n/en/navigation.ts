import { langLoadLogAtClient } from "../../components/i18n/utilities";

const kind = "navigation";

langLoadLogAtClient("ja", kind);

const Langs = {
  spreadNav: "Spread navigation",
  shrinkNav: "Shrink navigation",
  openNav: "Open navigation",
  closeNav: "Close navigation",
  autoNav: "Navigation auto size",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
