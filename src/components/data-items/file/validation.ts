import { getAccept, getSizeText } from "../../objects/file";

const defaultLabel = "ファイル";

export const $fileValidations = (dataItem: DataItem.ArgObject<DataItem.$file>): Array<DataItem.Validation<DataItem.$file>> => {
  const validations: Array<DataItem.Validation<DataItem.$file>> = [];

  const label = dataItem.label || dataItem.name || defaultLabel;

  validations.push(({ value, fullName }) => {
    if (value == null || value instanceof File) return undefined;
    return { type: "e", code: "type", fullName, msg: `${label}はファイル型を設定してください。` };
  });

  if (dataItem.required) {
    validations.push((p) => {
      if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
      if (p.value != null) return undefined;
      return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を選択してください。` };
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
      return { type: "e", code: "accept", fullName, msg: `${label}のファイルタイプが不適切です` };
    });
  }

  if (dataItem.fileSize != null) {
    const sizeText = getSizeText(dataItem.fileSize);
    validations.push(({ value, fullName }) => {
      if (value == null) return undefined;
      if (value.size >= dataItem.fileSize!) return undefined;
      return { type: "e", code: "size", fullName, msg: `${label}のファイルサイズは${sizeText}以内をアップロードしてください。` };
    });
  }

  return validations;
};
