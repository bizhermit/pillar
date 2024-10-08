import { langLoadLogAtClient, writeHas } from "../utilities";

const kind = "form";

langLoadLogAtClient("ja", kind);

const Langs = {
  revert: "Revert",
  progress: "Progress",
  clear: (p) => `Clear${writeHas(p, "s", s => ` ${s}`)}`,
  clearHistory: (p) => `Clear${writeHas(p, "s", s => ` ${s}`)} history`,
  clearCanvasAndHistory: "Clear canvas and history",
  today: "Today",
  dispCurrent: "Display current",
  sign: "Sign",
  canvas: "Canvas",
  selectFile: "Select File",
  dragAndDropFile: "Drag & Drop File",
} as const satisfies I18N_Langs[typeof kind];

export default Langs;
