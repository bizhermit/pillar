import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";
import { langFactory } from "@/i18n/factory";

const lang = langFactory();

export const sample_text = $str({
  name: "sample_text",
  label: lang("sandbox.sample_textLabel"),
  required: true,
});

export const sample_number = $num({
  name: "sample_num",
  label: lang("sandbox.sample_numberLabel"),
  required: true,
});

export const sample_bool = $bool({
  name: "sample_bool",
  label: lang("sandbox.sample_boolLabel"),
  required: true,
});
