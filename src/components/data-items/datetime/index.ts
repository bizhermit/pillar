export const $datetime = <P extends Omit<DataItem.$datetime, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "datetime",
  } as const;
};
