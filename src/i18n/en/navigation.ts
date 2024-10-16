import { langLoadLogAtClient } from "@/i18n/utilities";

const kind = "navigation";

langLoadLogAtClient("en", kind);

const Langs = {
  spreadNav: "Spread navigation",
  shrinkNav: "Shrink navigation",
  openNav: "Open navigation",
  closeNav: "Close navigation",
  autoNav: "Navigation auto size",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
