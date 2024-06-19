const $array = <T extends DataItem.$atoms | DataItem.$array<any> | Array<DataItem.$object>, P extends Omit<DataItem.$array<T>, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "array",
  } as const;
};

export default $array;
