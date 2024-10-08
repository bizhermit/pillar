export const getDataItemLabel = ({ dataItem, env }: { dataItem: DataItem.ArgObject<DataItem.$object> | undefined; env: Partial<Pick<DataItem.Env, "lang">> }, defaultLabel?: string) => {
  return (dataItem ? (dataItem.label || ((dataItem.labelLang && env.lang) ? env.lang(dataItem.labelLang) : "") || defaultLabel || dataItem.name) : defaultLabel) || (env.lang?.("common.value") || "値");
};
