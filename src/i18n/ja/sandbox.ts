import { langLoadLogAtClient } from "@/i18n/utilities";

const kind = "sandbox";

langLoadLogAtClient("ja", kind);

const Langs = {
  sample_textLabel: "テキスト",
  sample_numberLabel: "数値",
  sample_boolLabel: "真偽値",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
