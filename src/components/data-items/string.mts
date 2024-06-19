const $str = <V extends string, P extends Omit<DataItem.$str<V>, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "str",
  } as const;
};

export default $str;
