"use client";

import { use, useId, useLayoutEffect, useState } from "react";
import { FormContext } from ".";

export const useFormValue = <T extends any>(name: string) => {
  const id = useId();
  const form = use(FormContext);
  const [value, setVal] = useState<T | undefined>(() => form.getValue(name));

  useLayoutEffect(() => {
    const { unmount } = form.mountObserver({
      id,
      changeValue: (params) => {
        if (params.name !== name) return;
        setVal(form.getValue(name));
      },
    });
    setVal(form.getValue(name));
    return () => {
      unmount();
    };
  }, [name]);

  return {
    value,
    setValue: (value: T) => form.setValue(name, value),
    initialized: form.process !== "init",
  } as const;
};

export const useFormError = () => {
  const id = useId();
  const form = use(FormContext);
  const [error, setError] = useState(false);

  useLayoutEffect(() => {
    const { unmount } = form.mountObserver({
      id,
      changeValue: () => {
        setError(form.hasError());
      },
    });
    return () => {
      unmount();
    };
  }, []);

  return {
    disabled: form.disabled,
    process: form.process,
    processing: form.processing,
    error,
  } as const;
};
