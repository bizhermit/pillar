import { langLoadLogAtClient } from "../utilities";

const kind = "common";

langLoadLogAtClient("ja", kind);

const LangCommon = {
  halloWorld: "新世界へようこそ",
} as const satisfies I18N_Langs[typeof kind];

export default LangCommon;
