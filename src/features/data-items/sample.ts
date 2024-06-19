import $array from "@/data-items/array.mjs";
import $boolNum from "@/data-items/bool-number.mjs";
import $boolStr from "@/data-items/bool-string.mjs";
import $bool from "@/data-items/bool.mjs";
import $date from "@/data-items/date.mjs";
import $num from "@/data-items/number.mjs";
import $str from "@/data-items/string.mjs";
import $struct from "@/data-items/struct.mjs";

export const sample_str = $str({
  name: "sample_str",
  label: "サンプル文字列",
  maxLength: 10,
  // required: true,
  source: [
    { id: "1", label: "item-1" },
    { id: "2", label: "item-2" },
    { id: "3", label: "item-3" },
  ],
  validations: [
    (props) => {
      const _v = props.value;
      props.self.name;
      return undefined;
    },
  ],
});

sample_str.source[0].id;
export type TYPE_STR = DataItem.ValueType<typeof sample_str>;
export type TYPE_STR_S = DataItem.SourceValueType<typeof sample_str>;

export const sample_num = $num({
  name: "sample_num",
  label: "サンプル数値",
  required: true,
  max: 1980,
  source: [
    { id: 1, label: "item-1" },
    { id: 2, label: "item-2" },
    { id: 3, label: "item-3" },
  ],
});

sample_num.max;
export type TYPE_NUM = DataItem.ValueType<typeof sample_num>;
export type TYPE_NUM_S = DataItem.SourceValueType<typeof sample_num>;

export const sample_bool = $bool({
  name: "sample_bool",
  trueValue: false,
  falseValue: true,
  source: [
    { id: true, label: "TRUE" },
    { id: false, label: "FALSE" },
  ],
});

sample_bool.name;
sample_bool.trueValue;
sample_bool.falseValue;
export type TYPE_BOOL = DataItem.ValueType<typeof sample_bool>;

export const sample_bool_num = $boolNum({
  name: "sample_bool_num",
  trueValue: 1,
  falseValue: 2,
});

sample_bool_num.trueValue;
sample_bool_num.falseValue;
export type TYPE_BOOL_NUM = DataItem.ValueType<typeof sample_bool_num>;

export const sample_bool_str = $boolStr({
  name: "sample_bool_str",
  // trueValue: "nippon",
  // falseValue: "nihon",
});

sample_bool_str.trueValue;
sample_bool_str.falseValue;
export type TYPE_BOOL_STR = DataItem.ValueType<typeof sample_bool_str>;

export const sample_date = $date({
  name: "sample_date",
  label: "日付",
});

export type TYPE_DATE = DataItem.ValueType<typeof sample_date>;

export const sample_array = $array({
  name: "sample_array",
  item: sample_num,
  required: true,
});

sample_array.item.name;
export type TYPE_ARR = DataItem.ValueType<typeof sample_array>;

export const sample_array_obj = $array({
  name: "sample_array_obj",
  item: [
    sample_str,
    sample_num,
  ],
});

sample_array_obj.item[0].name;
sample_array_obj.item[1].name;
export type TYPE_ARR_OBJ = DataItem.ValueType<typeof sample_array_obj>;

const _hoge: DataItem.Props<[
  typeof sample_str,
  typeof sample_num,
  typeof sample_bool,
]> = {
  sample_num: 1,
  sample_str: "2",
};

export const sample_struct = $struct({
  name: "sample_struct",
  item: [
    sample_num,
    sample_str,
    sample_bool,
  ],
});

sample_struct.item[0].name;
export type TYPE_STRUCT = DataItem.ValueType<typeof sample_struct>;
