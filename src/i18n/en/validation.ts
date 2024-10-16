import { langLoadLogAtClient, writeHas } from "@/i18n/utilities";

const kind = "validation";

langLoadLogAtClient("en", kind);

const sub = (s: string | undefined, func?: (s: string) => string) => s ? (func?.(s) ?? s) : "";

const sp: I18N_Langs[typeof kind]["stringPattern"] = ({ s, pattern }) => `Invalid text pattern [${pattern}]`;

const Langs = {
  error: "Validation Error",
  single: ({ s }) => `Don't set multiple${sub(s, s => ` ${s}`)}`,
  multiple: ({ s }) => `Set multiple${sub(s, s => ` ${s}`)}`,
  parseSucceeded: ({ s, type, ...p }) => `Parse to ${type}${writeHas(p, "before", b => ` [${b}]->[${p.after}]`)}`,
  parseFailed: ({ s, type, ...p }) => `Failed to parse to ${type}${writeHas(p, "value", v => ` [${v}]`)}`,
  typeOf: ({ s, type }) => `Set ${sub(s, s => `${s}`) || "this item"} as ${type}`,
  required: ({ s }) => `${sub(s, s => `${s} is`)} required`,
  length: ({ s, len, ...p }) => `Invalid length. length:${len}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  minLength: ({ s, minLen, ...p }) => `Invalid min length. min:${minLen}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  maxLength: ({ s, maxLen, ...p }) => `Invalid max length. max:${maxLen}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  rangeLength: ({ s, minLen, maxLen, ...p }) => `Invalid range length. min:${minLen} / max:${maxLen}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  min: ({ s, min, }) => `Invalid min. min:${min}`,
  max: ({ s, max, }) => `Invalid max. max:${max}`,
  range: ({ s, min, max }) => `Invalid range. min:${min} / max:${max}`,
  float: ({ s, float, ...p }) => `Invalid float. float:${float}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  number: ({ s, num, ...p }) => `Invalid number of ${sub(s)}.${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  minNumber: ({ s, minNum, ...p }) => `Invalid number of ${sub(s)}. min:${minNum}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  maxNumber: ({ s, maxNum, ...p }) => `Invalid number of ${sub(s)}. max:${maxNum}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  rangeNumber: ({ s, minNum, maxNum, ...p }) => `Invalid range. min:${minNum} / max:${maxNum}${writeHas(p, "cur", cur => ` [current: ${cur}]`)}`,
  minDate: ({ s, minDate }) => `Invalid min date. min:${minDate}`,
  maxDate: ({ s, maxDate }) => `Invalid min date. max:${maxDate}`,
  rangeDate: ({ s, minDate, maxDate }) => `Invalid date range. min:${minDate} / max:${maxDate}`,
  contextDate: () => `Invalid date context`,
  contextTime: () => `Invalid time context`,
  fileAccept: ({ s }) => `Invalid accept`,
  fileSize: ({ s, size }) => `Invalid file size under ${size}`,
  contain: ({ s }) => `Invalid value`,
  choices: (p) => `Choice has no value${writeHas(p, "value", v => ` [${v}]`)}`,
  stringPattern: sp,
  int: ({ s }) => sp({ s, pattern: "integer" }),
  halfNum: ({ s }) => sp({ s, pattern: "half width number" }),
  fullNum: ({ s }) => sp({ s, pattern: "full width number" }),
  num: ({ s }) => sp({ s, pattern: "number" }),
  halfAlpha: ({ s }) => sp({ s, pattern: "half width alphabet" }),
  fullAlpha: ({ s }) => sp({ s, pattern: "full width alphabet" }),
  alpha: ({ s }) => sp({ s, pattern: "alphabet" }),
  halfAlphaNum: ({ s }) => sp({ s, pattern: "half width alphabet and number" }),
  halfApphaNumSyn: ({ s }) => sp({ s, pattern: "half width alphabet and number, symbol" }),
  halfKatakana: ({ s }) => sp({ s, pattern: "half width katakana" }),
  fullKatakana: ({ s }) => sp({ s, pattern: "full width katakana" }),
  katakana: ({ s }) => sp({ s, pattern: "katakana" }),
  hiragana: ({ s }) => sp({ s, pattern: "hiragana" }),
  halfWidth: ({ s }) => sp({ s, pattern: "half width" }),
  fullWidth: ({ s }) => sp({ s, pattern: "full width" }),
  email: ({ s }) => sp({ s, pattern: "mail-address" }),
  tel: ({ s }) => sp({ s, pattern: "phone number" }),
  url: ({ s }) => sp({ s, pattern: "URL" }),
  writeSign: ({ s }) => `Sign in${sub(s, s => `${s}`)}`,
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
