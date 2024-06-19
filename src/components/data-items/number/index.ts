const $num = <V extends number, P extends Omit<DataItem.$num<V>, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "num",
  } as const;
};

export default $num;
