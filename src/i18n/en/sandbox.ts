import { langLoadLogAtClient } from "@/i18n/utilities";

const kind = "sandbox";

langLoadLogAtClient("en", kind);

const Langs = {
  sample_textLabel: "text",
  sample_numberLabel: "number",
  sample_boolLabel: "boolean",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
