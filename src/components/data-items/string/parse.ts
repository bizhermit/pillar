export const $strParse = <V extends string>(value: any, dataItem: DataItem.$str<V>) => {
  return value as V;
};
