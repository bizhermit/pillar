export const $date = <P extends Omit<DataItem.$date, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "date",
  } as const;
};

export const $month = <P extends Omit<DataItem.$month, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "month",
  } as const;
};
