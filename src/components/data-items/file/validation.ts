import { getAccept, getSizeText } from "../../objects/file";

const defaultLabel = "ファイル";

export const $fileValidation = (dataItem: DataItem.$file): Array<DataItem.Validation<DataItem.$file>> => {
  const validations: Array<DataItem.Validation<DataItem.$file>> = [];

  const label = dataItem.label || defaultLabel;

  validations.push(({ value }) => {
    if (value == null || value instanceof File) return undefined;
    return { type: "e", code: "type", msg: `${label}はファイル型を設定してください。` };
  });

  if (dataItem.required) {
    validations.push(({ value }) => {
      if (value != null) return undefined;
      return { type: "e", code: "required", msg: `${label}を選択してください。` };
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

    validations.push(({ value }) => {
      if (value == null) return undefined;
      if (validAccept(value)) return undefined;
      return { type: "e", code: "accept", msg: `${label}のファイルタイプが不適切です` };
    });
  }

  if (dataItem.fileSize != null) {
    const sizeText = getSizeText(dataItem.fileSize);
    validations.push(({ value }) => {
      if (value == null) return undefined;
      if (value.size >= dataItem.fileSize!) return undefined;
      return { type: "e", code: "size", msg: `${label}のファイルサイズは${sizeText}以内をアップロードしてください。` };
    });
  }

  return validations;
};
