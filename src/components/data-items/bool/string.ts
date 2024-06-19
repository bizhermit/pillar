const $boolStr = <P extends Omit<DataItem.$boolStr<string, string>, "type" | "trueValue" | "falseValue"> & Partial<Pick<DataItem.$boolStr<string, string>, "trueValue" | "falseValue">>>(props: Readonly<P>) => {
  return {
    ...props,
    type: "str",
    trueValue: (props.trueValue ?? "1") as P extends { trueValue: infer True } ? True : "1",
    falseValue: (props.falseValue ?? "0") as P extends { falseValue: infer False } ? False : "0",
  } as const;
};

export default $boolStr;
