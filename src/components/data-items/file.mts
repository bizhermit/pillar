export const $file = <P extends Omit<DataItem.$file, "type">>(props: Readonly<P>) => {
  return {
    ...props,
    type: "file",
  } as const;
};
