import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";

export const sample_text = $str({
  name: "sample_text",
  labelLang: "sandbox.sample_textLabel",
  required: true,
});

export const sample_number = $num({
  name: "sample_num",
  labelLang: "sandbox.sample_numberLabel",
  required: true,
});

export const sample_bool = $bool({
  name: "sample_bool",
  labelLang: "sandbox.sample_boolLabel",
  required: true,
});
