import { $bool } from "@/data-items/bool";
import { $date } from "@/data-items/date";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";

export const sample_text = $str({
  name: "sample_text",
  label: "sandbox.sample_textLabel",
  required: true,
  // minLength: 3,
});

export const sample_number = $num({
  name: "sample_num",
  label: "sandbox.sample_numberLabel",
  required: true,
});

export const sample_bool = $bool({
  name: "sample_bool",
  label: "sandbox.sample_boolLabel",
  required: true,
});

export const sample_date = $date({
  name: "sample_date",
  required: true,
  min: () => new Date(),
  max: new Date(2030, 11, 31),
});
