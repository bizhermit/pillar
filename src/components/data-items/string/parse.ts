const defaultLabel = "値";

export const $strParse = <V extends string>({ value, dataItem, fullName }: DataItem.ParseProps<DataItem.$str<V> | DataItem.$boolStr<V, V>>, skipRefSource?: boolean): DataItem.ParseResult<V> => {
  if (Array.isArray(value) && value.length > 1) {
    return [undefined, { type: "e", code: "multiple", fullName, msg: `${dataItem.label || defaultLabel}が複数設定されています。` }];
  }

  const v = (value == null || typeof value === "string") ? value : String(value);
  if (dataItem.source && !skipRefSource && !dataItem.source.find(s => s.id === v)) {
    return [v, { type: "e", code: "source", fullName, msg: `${dataItem.label || defaultLabel}は有効な値を設定してください。` }];
  }
  return [v];
};
