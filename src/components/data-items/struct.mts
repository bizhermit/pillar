const $struct = <T extends Array<DataItem.$object>, P extends Omit<DataItem.$struct<T>, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "struct",
  } as const;
};

export default $struct;
