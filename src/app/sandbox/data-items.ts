import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";

export const sample_text = $str({
  name: "sample_text",
  label: "sandbox.sample_textLabel",
  required: true,
  minLength: 3,
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
