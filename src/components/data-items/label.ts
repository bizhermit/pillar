export const getDataItemLabel = ({ dataItem, env }: { dataItem: DataItem.ArgObject<DataItem.$object> | undefined; env: DataItem.Env }, defaultLabel?: string) => {
  return (dataItem ? (dataItem.label || (dataItem.labelLang ? env.lang(dataItem.labelLang) : "") || defaultLabel || dataItem.name) : defaultLabel) || "値";
};
