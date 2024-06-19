export const $bool = <P extends Omit<DataItem.$bool, "type" | "trueValue" | "falseValue"> & Partial<Pick<DataItem.$bool<boolean, boolean>, "trueValue" | "falseValue">>>(props: Readonly<P>) => {
  return {
    ...props,
    type: "bool",
    trueValue: (props.trueValue ?? true) as P extends { trueValue: infer True } ? True : true,
    falseValue: (props.falseValue ?? false) as P extends { falseValue: infer False } ? False : false,
  } as const;
};

export const $boolNum = <P extends Omit<DataItem.$boolNum, "type" | "trueValue" | "falseValue"> & Partial<Pick<DataItem.$boolNum<number, number>, "trueValue" | "falseValue">>>(props: Readonly<P>) => {
  return {
    ...props,
    type: "num",
    trueValue: (props.trueValue ?? 1) as P extends { trueValue: infer True } ? True : 1,
    falseValue: (props.falseValue ?? 0) as P extends { falseValue: infer False } ? False : 0,
  } as const;
};

export const $boolStr = <P extends Omit<DataItem.$boolStr<string, string>, "type" | "trueValue" | "falseValue"> & Partial<Pick<DataItem.$boolStr<string, string>, "trueValue" | "falseValue">>>(props: Readonly<P>) => {
  return {
    ...props,
    type: "str",
    trueValue: (props.trueValue ?? "1") as P extends { trueValue: infer True } ? True : "1",
    falseValue: (props.falseValue ?? "0") as P extends { falseValue: infer False } ? False : "0",
  } as const;
};
