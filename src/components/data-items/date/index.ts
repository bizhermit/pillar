const $date = <P extends Omit<DataItem.$date, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "date",
  } as const;
};

export default $date;
