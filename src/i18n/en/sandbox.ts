import { langLoadLogAtClient } from "../../components/i18n/utilities";

const kind = "sandbox";

langLoadLogAtClient("ja", kind);

const Langs = {
  sample_textLabel: "text",
  sample_numberLabel: "number",
  sample_boolLabel: "boolean",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
