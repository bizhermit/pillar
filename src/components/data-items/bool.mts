const $bool = <P extends Omit<DataItem.$bool, "type" | "trueValue" | "falseValue"> & Partial<Pick<DataItem.$bool<boolean, boolean>, "trueValue" | "falseValue">>>(props: Readonly<P>) => {
  return {
    ...props,
    type: "bool",
    trueValue: (props.trueValue ?? true) as P extends { trueValue: infer True } ? True : true,
    falseValue: (props.falseValue ?? false) as P extends { falseValue: infer False } ? False : false,
  } as const;
};

export default $bool;
