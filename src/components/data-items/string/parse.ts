const defaultLabel = "値";

export const $strParse = <V extends string>({ value, dataItem, fullName }: DataItem.ParseProps<DataItem.$str<V> | DataItem.$boolStr<V, V>>, skipRefSource?: boolean): DataItem.ParseResult<V> => {
  const v = (value == null || typeof value === "string") ? value : String(value);
  if (dataItem.source && !skipRefSource && !dataItem.source.find(s => s.id === v)) {
    return [v, { type: "e", code: "source", fullName, msg: `${dataItem.label || defaultLabel}は有効な値を設定してください。` }];
  }
  return [v];
};
