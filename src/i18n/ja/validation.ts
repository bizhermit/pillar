import { langLoadLogAtClient, writeHas } from "@/i18n/utilities";

const kind = "validation";

langLoadLogAtClient("ja", kind);

const sub = (s: string | undefined, func: (s: string) => string) => s ? func(s) : "";

const sp: I18N_Langs[typeof kind]["stringPattern"] = ({ s, pattern }) => `${sub(s, s => `${s}は`)}${pattern}で入力してください`;

const Langs = {
  error: "バリデーションエラー",
  single: ({ s }) => `${sub(s, s => `${s}を`)}複数設定しないでください`,
  multiple: ({ s }) => `${sub(s, s => `${s}を`)}複数設定してください`,
  parseSucceeded: ({ s, type, ...p }) => `${sub(s, s => `${s}を`)}${type}に変換しました${writeHas(p, "before", b => ` [${b}]->[${p.after}]`)}`,
  parseFailed: ({ s, type, ...p }) => `${sub(s, s => `${s}を`)}${type}に変換できませんでした${writeHas(p, "value", v => ` [${v}]`)}`,
  typeOf: ({ s, type, mode }) => `${sub(s, s => `${s}は`)}${type}を${mode === "set" ? "設定" : "入力"}してください`,
  required: ({ s, mode }) => `${sub(s, s => `${s}を`)}${mode === "select" ? "選択" : mode === "set" ? "設定" : "入力"}してください`,
  length: ({ s, len, ...p }) => `${sub(s, s => `${s}は`)}${len}文字で入力してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  minLength: ({ s, minLen, ...p }) => `${sub(s, s => `${s}は`)}${minLen}文字以上で入力してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  maxLength: ({ s, maxLen, ...p }) => `${sub(s, s => `${s}は`)}${maxLen}文字以内で入力してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  rangeLength: ({ s, minLen, maxLen, ...p }) => `${s}は${minLen}文字以上${maxLen}以下で入力してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  min: ({ s, min, }) => `${sub(s, s => `${s}は`)}${min}以上で入力してください`,
  max: ({ s, max, }) => `${sub(s, s => `${s}は`)}${max}以下で入力してください`,
  range: ({ s, min, max }) => `${sub(s, s => `${s}は`)}${min}以上${max}以下で入力してください`,
  float: ({ s, float, ...p }) => `${sub(s, s => `${s}は`)}少数第${float}位までで入力してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  number: ({ s, num, ...p }) => `${sub(s, s => `${s}は`)}${num}件を設定してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  minNumber: ({ s, minNum, ...p }) => `${sub(s, s => `${s}は`)}${minNum}件以上を設定してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  maxNumber: ({ s, maxNum, ...p }) => `${sub(s, s => `${s}は`)}${maxNum}件以下を設定してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  rangeNumber: ({ s, minNum, maxNum, ...p }) => `${sub(s, s => `${s}は`)}${minNum}件以上${maxNum}件以下を設定してください${writeHas(p, "cur", cur => `（現在：${cur}）`)}`,
  minDate: ({ s, minDate }) => `${sub(s, s => `${s}は`)}${minDate}以降を入力してください`,
  maxDate: ({ s, maxDate }) => `${sub(s, s => `${s}は`)}${maxDate}以前を入力してください`,
  rangeDate: ({ s, minDate, maxDate }) => `${sub(s, s => `${s}は`)}は${minDate}～${maxDate}の範囲で入力してください`,
  contextDate: () => `日付の前後関係が不適切です`,
  contextTime: () => `時間の前後関係が不適切です`,
  fileAccept: ({ s }) => `${sub(s, s => `${s}の`)}拡張子が不適切です`,
  fileSize: ({ s, size }) => `${sub(s, s => `${s}の`)}ファイルサイズは${size}以内で設定してください`,
  contain: ({ s }) => `${sub(s, s => `${s}は`)}有効な値を設定してください`,
  choices: (p) => `選択肢に値が存在しません${writeHas(p, "value", v => ` [${v}]`)}`,
  stringPattern: sp,
  int: ({ s }) => sp({ s, pattern: "数値" }),
  halfNum: ({ s }) => sp({ s, pattern: "半角数字" }),
  fullNum: ({ s }) => sp({ s, pattern: "全角数字" }),
  num: ({ s }) => sp({ s, pattern: "数字" }),
  halfAlpha: ({ s }) => sp({ s, pattern: "半角英字" }),
  fullAlpha: ({ s }) => sp({ s, pattern: "全角英字" }),
  alpha: ({ s }) => sp({ s, pattern: "英字" }),
  halfAlphaNum: ({ s }) => sp({ s, pattern: "半角英数字" }),
  halfApphaNumSyn: ({ s }) => sp({ s, pattern: "半角英数字" }),
  halfKatakana: ({ s }) => sp({ s, pattern: "半角カタカナ" }),
  fullKatakana: ({ s }) => sp({ s, pattern: "全角カタカナ" }),
  katakana: ({ s }) => sp({ s, pattern: "カタカナ" }),
  hiragana: ({ s }) => sp({ s, pattern: "ひらがな" }),
  halfWidth: ({ s }) => sp({ s, pattern: "半角" }),
  fullWidth: ({ s }) => sp({ s, pattern: "全角" }),
  email: ({ s }) => sp({ s, pattern: "メールアドレス" }),
  tel: ({ s }) => sp({ s, pattern: "電話番号" }),
  url: ({ s }) => sp({ s, pattern: "URL" }),
  writeSign: ({ s }) => `${sub(s, s => `${s}を`)}記入してください`,
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
