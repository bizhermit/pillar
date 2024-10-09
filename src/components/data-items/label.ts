export const getDataItemLabel = ({ dataItem, env: { lang } }: { dataItem: DataItem.ArgObject<DataItem.$object> | undefined; env: Pick<DataItem.Env, "lang"> }, defaultLabel?: string) => {
  return (dataItem ? ((dataItem.label ? lang(dataItem.label) : "") || dataItem.labelAsIs || defaultLabel || dataItem.name) : defaultLabel) || (lang("common.value") || "値");
};
