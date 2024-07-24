"use client";

import { createContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type FormEvent, type FormHTMLAttributes, type MutableRefObject } from "react";
import { clone } from "../../../objects";
import { getValue, setValue } from "../../../objects/struct";
import { useRefState } from "../../hooks/ref-state";

type FormItemState = {
  id: string;
  state: DataItem.ValidationResult | null | undefined;
};

type FormItemMountProps = {
  id: string;
  name: string | undefined;
  tieInNames?: Array<string>;
  get: <T>() => T;
  set: (arg: FormItemSetArg<any>) => void;
  reset: (edit: boolean) => void;
  changeRefs: (name: string) => void;
  hasChanged: () => boolean;
  dataItem: PickPartial<DataItem.$object, DataItem.OmitableProps>;
  preventCollectForm: boolean | undefined;
};

type FormState = "init" | "submit" | "reset" | "" | "nothing";

type FormContextProps = {
  bind: { [v: string]: any };
  disabled?: boolean;
  state: FormState;
  pending: boolean;
  method?: string;
  hasError: boolean;
  setItemState: Dispatch<FormItemState>;
  getMountedItems: () => { [id: string]: FormItemMountProps };
  change: (name: string | undefined) => void;
  mount: (props: FormItemMountProps) => {
    unmount: () => void;
  };
  getValue: <T>(name: string) => T;
  setValue: (name: string, value: any, edit?: boolean) => void;
};

export const FormContext = createContext<FormContextProps>({
  bind: {},
  disabled: false,
  state: "nothing",
  pending: false,
  hasError: false,
  setItemState: () => { },
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

  const [formState, setFormState, formStateRef] = useRefState<FormState>("init");

  const items = useRef<{ [id: string]: FormItemMountProps }>({});
  const findItem = (name: string) => {
    const id = Object.keys(items.current).find(id => items.current[id].name === name);
    if (id == null) return undefined;
    return items.current[id];
  };

  const [itemState, setItemState] = useReducer((cur: { [id: string]: Exclude<FormItemState["state"], null | undefined> }, { id, state }: FormItemState) => {
    const buf = cur[id];
    if (state == null) {
      if (buf == null) return cur;
      const ret = { ...cur };
      delete ret[id];
      return ret;
    }
    if (buf == null) {
      return {
        ...cur,
        [id]: state,
      };
    }
    if (buf.type === state.type && buf.msg === state.msg) return cur;
    return {
      ...cur,
      [id]: state,
    };
  }, {});

  const hasError = useMemo(() => {
    return Object.keys(itemState).some(k => itemState[k].type === "e");
  }, [itemState]);

  const getFormData = () => new FormData($ref.current!);

  const getBindData = (opts?: GetBindDataOptions) => {
    if (opts?.pure) return clone($bind);
    const ret = {};
    Object.keys(items.current).forEach(id => {
      const { name, tieInNames, hasChanged, preventCollectForm } = items.current[id];
      if (preventCollectForm) return;
      if (!name && (tieInNames ?? []).length === 0) return;
      if (!opts?.appendNotChanged && !hasChanged()) return;
      if (name) setValue(ret, name, clone(getValue($bind, name)[0]));
      tieInNames?.forEach(n => {
        setValue(ret, n, clone(getValue($bind, n)[0]));
      });
    });
    return ret as any;
  };

  const get = (name: string) => findItem(name)?.get<any>();

  const set = (name: string, value: any, edit?: boolean) => findItem(name)?.set({ value, edit: edit ?? false, parse: true });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    if (disabled || formStateRef.current) {
      e.preventDefault();
      return;
    }
    setFormState("submit");
    if (onSubmit === false) {
      e.preventDefault();
      setFormState("");
      return;
    }
    if (onSubmit == null || onSubmit === true) return;

    try {
      let keepLock = false;
      const ret = onSubmit({
        event: e,
        hasError,
        keepLock: () => {
          keepLock = true;
          return () => setFormState("");
        },
        getFormData,
        getBindData,
      });
      if (ret == null || ret === false) {
        e.preventDefault();
        if (!keepLock) setFormState("");
        return;
      }
      if (ret === true) return;
      e.preventDefault();
      if (ret instanceof Promise) {
        ret.finally(() => {
          if (!keepLock) setFormState("");
        });
      }
    } catch {
      e.preventDefault();
      setFormState("");
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
    if (disabled || formStateRef.current) return;
    setFormState("reset");
    if (onReset == null || onReset === true) {
      resetItems(() => setFormState(""));
      return;
    }
    if (onReset === false) {
      setFormState("");
      return;
    }

    try {
      const ret = onReset({
        event: e,
        getFormData,
        getBindData,
      });
      if (ret == null || ret === true) {
        resetItems(() => setFormState(""));
        return;
      }
      if (ret === false) {
        setFormState("");
        return;
      }
      if (ret instanceof Promise) {
        ret
          .then((r) => {
            if (r === false) {
              setFormState("");
              return;
            }
            resetItems(() => setFormState(""));
          }).catch(() => {
            setFormState("");
          });
      }
    } catch {
      setFormState("");
    }
  };

  if (ref) {
    ref.current = {
      getElement: () => $ref.current,
      submit: () => $ref.current?.submit(),
      reset: () => $ref.current?.reset(),
      getFormData,
      getBindData,
      getValue: get,
      setValue: set,
    };
  }

  useEffect(() => {
    setFormState("");
  }, []);

  return (
    <FormContext.Provider value={{
      method: props.method,
      bind: $bind,
      disabled,
      state: formState,
      pending: ["submit", "reset", "init"].includes(formState),
      hasError,
      change: (name) => {
        if (name == null) return;
        const self = findItem(name);
        const refs = [name, ...(self?.dataItem.refs ?? [])];
        Object.keys(items.current).forEach(id => {
          const item = items.current[id];
          if (self && item.name === self.name) return;
          if (!item.dataItem.refs?.some(ref => refs.some(r => ref === r))) return;
          item.changeRefs(name);
        });
      },
      mount: (p) => {
        items.current[p.id] = p;
        return {
          unmount: () => {
            delete items.current[p.id];
            setItemState({ id: p.id, state: null });
          },
        };
      },
      setItemState,
      getMountedItems: () => items.current,
      getValue: get,
      setValue: set,
    }}>
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
    </FormContext.Provider>
  );
};
