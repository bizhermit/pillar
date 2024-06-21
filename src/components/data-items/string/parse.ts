export const $strParse = <V extends string>(value: any, dataItem: DataItem.$str<V>, skipRefSource?: boolean): DataItem.ParseResult<V> => {
  const v = (value == null || typeof value === "string") ? value : String(value);
  if (dataItem.source && !skipRefSource) {
    if (dataItem.source.find(s => s.id === v)) return [v];
    return [v, { type: "e", code: "source", msg: `${dataItem.label || "値"}は有効な値を設定してください。` }];
  }
  return [v];
};
