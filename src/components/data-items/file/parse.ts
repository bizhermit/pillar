import { convertBase64ToFile, convertBlobToFile } from "@/objects/file";
import { getDataItemLabel } from "../label";

export const $fileParse = ({ value, dataItem, fullName, env }: DataItem.ParseProps<DataItem.$file>): DataItem.ParseResult<File> => {
  const s = getDataItemLabel({ dataItem, env });

  if (Array.isArray(value) && value.length > 1) {
    return [undefined, {
      type: "e",
      code: "multiple",
      fullName,
      msg: env.lang("validation.single", { s }),
    }];
  }
  if (value == null || value === "") return [undefined];

  try {
    if (value instanceof File) return [value];
    if (value instanceof Blob) {
      return [
        convertBlobToFile(value, dataItem.fileName || dataItem.name || ""),
        {
          type: "i",
          code: "parse",
          fullName,
          msg: env.lang("validation.parseSucceeded", {
            s,
            type: env.lang("common.typeOfFile"),
            before: "blob",
            after: "file",
          }),
        },
      ];
    }
    if (typeof value === "string") {
      return [
        convertBase64ToFile(value, dataItem.fileName || dataItem.name || "", { type: dataItem.type }),
        {
          type: "i",
          code: "parse",
          fullName,
          msg: env.lang("validation.parseSucceeded", {
            s,
            type: env.lang("common.typeOfFile"),
            before: "base64",
            after: "file",
          }),
        },
      ];
    }
    throw new Error;
  } catch {
    return [undefined, {
      type: "e",
      code: "parse",
      fullName,
      msg: env.lang("validation.parseFailed", {
        s,
        type: env.lang("common.typeOfFile"),
      }),
    }];
  }
};
