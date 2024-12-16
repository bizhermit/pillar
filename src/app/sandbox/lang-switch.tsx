"use client";

import { LANG_LABELS, LANGS } from "@/i18n/consts";
import { useLang } from "@/i18n/react-hook";
import { SelectBox } from "@/react/elements/form/items/select-box";

const source = [{ value: undefined, label: "(reset)" }, ...LANGS.map(v => ({ value: v, label: LANG_LABELS[v] }))];

export const LnagSwitch = () => {
  const lang = useLang();

  return (
    <div style={{ padding: 5 }}>
      <SelectBox
        source={source}
        onEdit={(v) => {
          if (v?.value) lang.set([v.value]);
          else lang.reset();
        }}
        defaultValue={lang.primary}
      />
    </div>
  );
};
