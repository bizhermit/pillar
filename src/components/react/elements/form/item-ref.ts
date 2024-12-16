"use client";

import { useCallback, useRef, useState } from "react";

export const useFormItemRef = <V extends any = any, IV extends any = V>() => {
  const [value, setVal] = useState<IV | DataItem.NullValue>(undefined);
  const [message, setMsg] = useState<DataItem.ValidationResult | null | undefined>(undefined);
  const con = useRef<FormItemRefConnectionParams<V, IV> | null>(null);
  const set = useCallback((v: V | DataItem.NullValue, edit: boolean) => con.current?.set({ value: v, edit, effect: true }), []);

  const f = ((c) => {
    con.current = c;
    return ([v, r]) => {
      setVal(v);
      setMsg(r);
    };
  }) as FormItemRefConnector<V, IV>;
  f.value = value;
  f.setValue = set;
  f.message = message;
  f.focus = () => con.current?.focus();
  return f as FormItemRef<Exclude<V, DataItem.NullValue>, Exclude<IV, DataItem.NullValue>>;
};
