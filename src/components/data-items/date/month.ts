const $month = <P extends Omit<DataItem.$month, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "month",
  } as const;
};

export default $month;
