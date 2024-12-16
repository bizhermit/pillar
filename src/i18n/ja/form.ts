import { langLoadLogAtClient, writeHas } from "@/i18n/utilities";

const kind = "form";

langLoadLogAtClient("ja", kind);

const Langs = {
  revert: "元に戻す",
  progress: "やり直す",
  clear: (p) => `${writeHas(p, "s", s => `${s}を`)}クリアする`,
  clearHistory: (p) => `${writeHas(p, "s", s => `${s}の`)}履歴をクリアする`,
  clearCanvasAndHistory: "キャンバスと履歴をクリアする",
  today: "今日",
  dispCurrent: "選択中を表示する",
  sign: "サイン",
  canvas: "キャンバス",
  selectFile: "ファイルを選択する",
  dragAndDropFile: "ファイルをドラッグ＆ドロップ",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
