import { getAccept, getSizeText } from "../../objects/file";
import { getDataItemLabel } from "../label";

export const $fileValidations = ({ dataItem, env }: DataItem.ValidationGeneratorProps<DataItem.$file>): Array<DataItem.Validation<DataItem.$file>> => {
  const validations: Array<DataItem.Validation<DataItem.$file>> = [];
  const s = getDataItemLabel({ dataItem, env }, "ファイル");

  validations.push(({ value, fullName }) => {
    if (value == null || value instanceof File) return undefined;
    return {
      type: "e",
      code: "type",
      fullName,
      msg: env.lang("validation.typeOf", {
        s,
        type: env.lang("common.typeOfFile"),
        mode: "set",
      }),
    };
  });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return {
        type: "e",
        code: "required",
        fullName: p.fullName,
        msg: env.lang("validation.required", { s, mode: "set" }),
      };
    });
  }

  const { accept, items } = getAccept(dataItem.accept);
  if (accept) {
    const validAccept = (file: File) => {
      return items.some(({ accept, type }) => {
        switch (type) {
          case "ext":
            return new RegExp(`${accept}$`, "i").test(file.name);
          case "type":
            return type.toLowerCase() === file.type.toLowerCase();
          default:
            return new RegExp(accept, "i").test(file.type);
        }
      });
    };

    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (validAccept(value)) return undefined;
      return {
        type: "e",
        code: "accept",
        fullName,
        msg: env.lang("validation.fileAccept", { s }),
      };
    });
  }

  if (dataItem.fileSize != null) {
    const sizeText = getSizeText(dataItem.fileSize);
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (value.size >= dataItem.fileSize!) return undefined;
      return {
        type: "e",
        code: "size",
        fullName,
        msg: env.lang("validation.fileSize", { s, size: sizeText }),
      };
    });
  }

  return validations;
};
