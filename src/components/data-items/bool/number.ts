const $boolNum = <P extends Omit<DataItem.$boolNum, "type" | "trueValue" | "falseValue"> & Partial<Pick<DataItem.$boolNum<number, number>, "trueValue" | "falseValue">>>(props: Readonly<P>) => {
  return {
    ...props,
    type: "num",
    trueValue: (props.trueValue ?? 1) as P extends { trueValue: infer True } ? True : 1,
    falseValue: (props.falseValue ?? 0) as P extends { falseValue: infer False } ? False : 0,
  } as const;
};

export default $boolNum;
