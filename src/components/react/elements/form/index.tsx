"use client";

import { createContext, useLayoutEffect, useMemo, useRef, type FormEvent, type FormHTMLAttributes, type MutableRefObject } from "react";
import { clone } from "../../../objects";
import { get, set } from "../../../objects/struct";
import { useRefState } from "../../hooks/ref-state";
import { LoadingBar } from "../loading";

type FormItemMountProps = {
  id: string;
  name: string | undefined;
  tieInNames?: Array<string>;
  get: <T>() => T;
  set: (arg: FormItemSetArg<any>) => void;
  reset: (edit: boolean) => void;
  getState: () => (DataItem.ValidationResult | null | undefined);
  changeRefs: (item: FormItemMountProps) => void;
  hasChanged: () => boolean;
  dataItem: PickPartial<DataItem.$object, DataItem.OmitableProps>;
  preventCollectForm: boolean | undefined;
  noInput?: boolean;
  autoFocus?: boolean;
};

type FormProcessState = "init" | "submit" | "reset" | "" | "nothing";

type FormContextProps = {
  bind: { [v: string]: any };
  disabled?: boolean;
  process: FormProcessState;
  processing: boolean;
  method?: string;
  hasError: () => boolean;
  getMountedItems: () => { [id: string]: FormItemMountProps };
  change: (id: string) => void;
  mount: (props: FormItemMountProps) => {
    unmount: () => void;
  };
  getValue: <T>(name: string) => T;
  setValue: (name: string, value: any, edit?: boolean) => void;
};

export const FormContext = createContext<FormContextProps>({
  bind: {},
  disabled: false,
  process: "nothing",
  processing: false,
  hasError: () => false,
  getMountedItems: () => {
    return {};
  },
  change: () => { },
  mount: () => {
    return {
      unmount: () => { },
    };
  },
  getValue: () => undefined as any,
  setValue: () => { },
});

type GetBindDataOptions = {
  pure: true;
} | {
  pure?: false | undefined;
  appendNotChanged?: boolean;
};

type FormRef<T extends { [v: string]: any } = { [v: string]: any }> = {
  getElement: () => (HTMLFormElement | null);
  submit: () => void;
  reset: () => void;
  getFormData: () => FormData;
  getBindData: (options?: GetBindDataOptions) => T;
  getValue: <T>(name: string) => T;
  setValue: (name: string, value: any) => void;
};

type FormOptions<T extends { [v: string]: any } = { [v: string]: any }> = {
  ref?: MutableRefObject<FormRef<T> | null>;
  encType?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
  disabled?: boolean;
  bind?: { [v: string | number | symbol]: any };
  preventEnterSubmit?: boolean;
  onSubmit?: ((props: {
    event: FormEvent<HTMLFormElement>;
    hasError: boolean;
    getFormData: () => FormData;
    getBindData: (options?: GetBindDataOptions) => T;
    keepLock: () => () => void;
  }) => (void | boolean | Promise<void>)) | boolean;
  onReset?: ((props: {
    event: FormEvent<HTMLFormElement>;
    getFormData: () => FormData;
    getBindData: (options?: GetBindDataOptions) => T;
  }) => (void | boolean | Promise<void | boolean>)) | boolean;
};

type FormProps<T extends { [v: string]: any } = { [v: string]: any }> = OverwriteAttrs<FormHTMLAttributes<HTMLFormElement>, FormOptions<T>>;

export const Form = <T extends { [v: string]: any } = { [v: string]: any }>({
  ref,
  disabled,
  bind,
  preventEnterSubmit,
  onSubmit,
  onReset,
  ...props
}: FormProps<T>) => {
  const $ref = useRef<HTMLFormElement>(null);
  const $bind = useMemo(() => {
    if (bind == null) return {};
    return bind;
  }, [bind]);

  const [process, setProcess, processRef] = useRefState<FormProcessState>("init");

  const items = useRef<{ [id: string]: FormItemMountProps }>({});
  const findItem = (name: string) => {
    const id = Object.keys(items.current).find(id => {
      const item = items.current[id];
      return !item.noInput && item.name === name;
    });
    if (id == null) return undefined;
    return items.current[id];
  };

  const hasError = () => {
    return Object.keys(items.current).some(id => items.current[id].getState()?.type === "e");
  };

  const getFormData = () => new FormData($ref.current!);

  const getBindData = (opts?: GetBindDataOptions) => {
    if (opts?.pure) return clone($bind);
    const ret = {};
    Object.keys(items.current).forEach(id => {
      const { name, tieInNames, hasChanged, preventCollectForm, noInput } = items.current[id];
      if (preventCollectForm || noInput) return;
      if (!name && (tieInNames ?? []).length === 0) return;
      if (!opts?.appendNotChanged && !hasChanged()) return;
      if (name) set(ret, name, clone(get($bind, name)[0]));
      tieInNames?.forEach(n => {
        set(ret, n, clone(get($bind, n)[0]));
      });
    });
    return ret as any;
  };

  const getValue = (name: string) => findItem(name)?.get<any>();

  const setValue = (name: string, value: any, edit?: boolean) => findItem(name)?.set({ value, edit: edit ?? false, parse: true });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    if (disabled || processRef.current) {
      e.preventDefault();
      return;
    }
    setProcess("submit");
    if (onSubmit === false) {
      e.preventDefault();
      setProcess("");
      return;
    }
    if (onSubmit == null || onSubmit === true) return;

    try {
      let keepLock = false;
      const ret = onSubmit({
        event: e,
        hasError: hasError(),
        keepLock: () => {
          keepLock = true;
          return () => setProcess("");
        },
        getFormData,
        getBindData,
      });
      if (ret == null || ret === false) {
        e.preventDefault();
        if (!keepLock) setProcess("");
        return;
      }
      if (ret === true) return;
      e.preventDefault();
      if (ret instanceof Promise) {
        ret.finally(() => {
          if (!keepLock) setProcess("");
        });
      }
    } catch {
      e.preventDefault();
      setProcess("");
    }
  };

  const resetItems = (callback?: () => void) => {
    Object.keys(items.current).forEach(id => {
      items.current[id].reset(false);
    });
    callback?.();
  };

  const reset = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled || processRef.current) return;
    setProcess("reset");
    if (onReset == null || onReset === true) {
      resetItems(() => setProcess(""));
      return;
    }
    if (onReset === false) {
      setProcess("");
      return;
    }

    try {
      const ret = onReset({
        event: e,
        getFormData,
        getBindData,
      });
      if (ret == null || ret === true) {
        resetItems(() => setProcess(""));
        return;
      }
      if (ret === false) {
        setProcess("");
        return;
      }
      if (ret instanceof Promise) {
        ret
          .then((r) => {
            if (r === false) {
              setProcess("");
              return;
            }
            resetItems(() => setProcess(""));
          }).catch(() => {
            setProcess("");
          });
      }
    } catch {
      setProcess("");
    }
  };

  if (ref) {
    ref.current = {
      getElement: () => $ref.current,
      submit: () => $ref.current?.submit(),
      reset: () => $ref.current?.reset(),
      getFormData,
      getBindData,
      getValue,
      setValue,
    };
  }

  useLayoutEffect(() => {
    setProcess("");
  }, []);

  return (
    <FormContext.Provider value={{
      method: props.method,
      bind: $bind,
      disabled,
      process,
      processing: ["submit", "reset", "init"].includes(process),
      hasError,
      change: (id) => {
        const self = items.current[id];
        if (!self.name) return;
        const refs = [self.name, ...(self?.dataItem.refs ?? [])];
        Object.keys(items.current).forEach(iid => {
          if (iid === id) return;
          const item = items.current[iid];
          if (!item.dataItem.refs?.some(ref => refs.some(r => ref === r))) return;
          item.changeRefs(self);
        });
      },
      mount: (p) => {
        items.current[p.id] = p;
        return {
          unmount: () => {
            delete items.current[p.id];
          },
        };
      },
      getMountedItems: () => items.current,
      getValue,
      setValue,
    }}>
      {(process === "submit" || process === "init") && <LoadingBar />}
      <form
        {...props}
        ref={$ref}
        onSubmit={submit}
        onReset={reset}
        onKeyDown={preventEnterSubmit ? (e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") {
            e.preventDefault();
          }
          props.onKeyDown?.(e);
        } : props.onKeyDown}
      />
      {process}
    </FormContext.Provider>
  );
};
