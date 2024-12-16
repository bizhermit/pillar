import { langLoadLogAtClient } from "@/i18n/utilities";

const kind = "common";

langLoadLogAtClient("ja", kind);

const Langs = {
  halloWorld: "新世界へようこそ",
  value: "値",
  typeOfString: "文字列型",
  typeOfNumber: "数値型",
  typeOfBool: "真偽値型",
  typeOfArray: "配列型",
  typeOfStruct: "連想配列型",
  typeOfDate: "日付型",
  typeOfDateTime: "日付型",
  typeOfTime: "時間型",
  typeOfFile: "ファイル型",
  ok: "OK",
  close: "閉じる",
  cancel: "キャンセル",
  save: "保存する",
  detail: "詳細",
  noData: "データが存在しません。",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
