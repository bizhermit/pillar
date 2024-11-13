"use client";

import { useCallback, useRef, useState } from "react";

export const useFormItemRef = <T extends any = any>(): FormItemRef<T | null | undefined> => {
  const [value, setVal] = useState<T | DataItem.NullValue>(undefined);
  const [message, setMsg] = useState<DataItem.ValidationResult | null | undefined>(undefined);
  const con = useRef<FormItemRefConnectionParams<T | null | undefined> | null>(null);
  const set = useCallback((v: T | DataItem.NullValue, edit: boolean) => con.current?.set({ value: v, edit, effect: true }), []);

  const f = ((c) => {
    con.current = c;
    return ([v, r]) => {
      setVal(v);
      setMsg(r);
    };
  }) as FormItemRefConnector<T | null | undefined>;
  f.value = value;
  f.setValue = set;
  f.message = message;
  f.focus = () => con.current?.focus();
  return f;
};
