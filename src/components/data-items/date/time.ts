const $time = <P extends Omit<DataItem.$time, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "time",
  } as const;
};

export default $time;
