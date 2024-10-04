import { langLoadLogAtClient } from "../utilities";

const kind = "common";

langLoadLogAtClient("en", "common");

const Common = {
  halloWorld: () => "Hallo, World.",
} as const satisfies Partial<I18N_Langs[typeof kind]>;

export default Common;
