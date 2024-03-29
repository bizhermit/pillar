import { dataItemKey } from "..";

export const dateDefaultTypeof: DateValueType = "string";

const $date = <
  C extends Omit<DataItem_Date, DI.Key | "type">
>(ctx?: Readonly<C>) => {
  return Object.freeze<DI.Freeze<DataItem_Date, C, {
    type: "date";
    typeof: C extends { typeof: infer TypeOf } ? TypeOf : typeof dateDefaultTypeof;
  }>>({
    typeof: dateDefaultTypeof,
    ...(ctx as any),
    [dataItemKey]: undefined,
    type: "date",
  });
};

export const $month = <
  C extends Omit<DataItem_Date, DI.Key | "type">
>(ctx?: Readonly<C>) => {
  return Object.freeze<DI.Freeze<DataItem_Date, C, {
    type: "month";
    typeof: C extends { typeof: infer TypeOf } ? TypeOf : typeof dateDefaultTypeof;
  }>>({
    typeof: dateDefaultTypeof,
    ...(ctx as any),
    [dataItemKey]: undefined,
    type: "month",
  });
};

export const $year = <
  C extends Omit<DataItem_Date, DI.Key | "type">
>(ctx?: Readonly<C>) => {
  return Object.freeze<DI.Freeze<DataItem_Date, C, {
    type: "year";
    typeof: C extends { typeof: infer TypeOf } ? TypeOf : typeof dateDefaultTypeof;
  }>>({
    typeof: dateDefaultTypeof,
    ...(ctx as any),
    [dataItemKey]: undefined,
    type: "year",
  });
};

export default $date;
