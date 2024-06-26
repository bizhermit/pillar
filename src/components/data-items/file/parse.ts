import { convertBase64ToFile, convertBlobToFile } from "@/objects/file";

const defaultLabel = "値";

export const $fileParse = ({ value, dataItem, fullName }: DataItem.ParseProps<DataItem.$file>): DataItem.ParseResult<File> => {
  if (value == null || value === "") return [undefined];

  const label = dataItem.label || defaultLabel;
  try {
    if (value instanceof File) return [value];
    if (value instanceof Blob) {
      return [
        convertBlobToFile(value, dataItem.fileName || dataItem.name),
        { type: "i", code: "parse", fullName, msg: `${label}をファイル型に変換しました。[blob]` },
      ];
    }
    if (typeof value === "string") {
      return [
        convertBase64ToFile(value, dataItem.fileName || dataItem.name, { type: dataItem.type }),
        { type: "i", code: "parse", fullName, msg: `${label}をファイル型に変換しました。[base64]` },
      ];
    }
    throw new Error;
  } catch {
    return [undefined, { type: "e", code: "parse", fullName, msg: `${label}をファイル型に変換できません。` }];
  }
};
