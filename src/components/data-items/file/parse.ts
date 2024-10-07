import { convertBase64ToFile, convertBlobToFile } from "@/objects/file";
import { getDataItemLabel } from "../label";

export const $fileParse = ({ value, dataItem, fullName, env }: DataItem.ParseProps<DataItem.$file>): DataItem.ParseResult<File> => {
  const label = getDataItemLabel({ dataItem, env });

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, { type: "e", code: "multiple", fullName, msg: `${label}が複数設定されています。` }];
  }
  if (value == null || value === "") return [undefined];

  try {
    if (value instanceof File) return [value];
    if (value instanceof Blob) {
      return [
        convertBlobToFile(value, dataItem.fileName || dataItem.name || ""),
        { type: "i", code: "parse", fullName, msg: `${label}をファイル型に変換しました。[blob]` },
      ];
    }
    if (typeof value === "string") {
      return [
        convertBase64ToFile(value, dataItem.fileName || dataItem.name || "", { type: dataItem.type }),
        { type: "i", code: "parse", fullName, msg: `${label}をファイル型に変換しました。[base64]` },
      ];
    }
    throw new Error;
  } catch {
    return [undefined, { type: "e", code: "parse", fullName, msg: `${label}をファイル型に変換できません。` }];
  }
};
