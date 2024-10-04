import { langLoadLogAtClient } from "../utilities";

const kind = "validation";

langLoadLogAtClient("ja", kind);

const LangValidation = {
  required: () => "入力してください。",
} as const satisfies I18N_Langs[typeof kind];

export default LangValidation;
