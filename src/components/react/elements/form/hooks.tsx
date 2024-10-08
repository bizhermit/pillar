"use client";

import { langFactory } from "@/i18n/factory";
import { use, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FormContext } from ".";
import { equals } from "../../../objects";
import { get, set } from "../../../objects/struct";
import { useRefState } from "../../hooks/ref-state";
import { CrossIcon } from "../icon";

type FormItemCoreArgs<
  SD extends DataItem.$object,
  D extends SD | undefined,
  V extends any,
  IV extends any = V
> = {
  dataItemDeps: Array<any>;
  getDataItem: (props: PickPartial<DataItem.$, DataItem.OmitableProps> & {
    dataItem: D | undefined;
  }, label: string | undefined) => DataItem.ArgObject<SD>;
  getTieInNames?: (params: { dataItem: SD; }) => (Array<string> | undefined);
  parse: (params: { dataItem: SD; env: DataItem.Env; label: string | undefined; }) => (props: DataItem.ParseProps<SD>, args: { bind: boolean; }) => DataItem.ParseResult<IV>;
  revert?: (v: IV | null | undefined) => (V | null | undefined);
  equals?: (v1: IV | null | undefined, v2: IV | null | undefined, params: { dataItem: DataItem.ArgObject<SD>; }) => boolean;
  validation: (props: {
    dataItem: DataItem.ArgObject<SD>;
    env: DataItem.Env,
    label: string | undefined;
    iterator: (funcs: Array<DataItem.Validation<any>>, arg: DataItem.ValidationProps<SD, any>) => (DataItem.ValidationResult | null | undefined);
  }) => (v: IV | null | undefined, arg: DataItem.ValidationProps<SD, any>) => (DataItem.ValidationResult | null | undefined);
  setBind?: (props: {
    value: IV | null | undefined;
    name: string | undefined;
    data: { [v: string]: any };
    dataItem: DataItem.ArgObject<SD>;
  }) => void;
  effect: (props: FormItemSetArg<IV> & {
    origin: any | null | undefined;
    dataItem: DataItem.ArgObject<SD>;
  }) => void;
  focus: () => void;
};

const env: DataItem.Env = {
  tzOffset: new Date().getTimezoneOffset(),
  lang: langFactory(),
};

export const useFormItemCore = <SD extends DataItem.$object, D extends SD | undefined, V extends any, IV extends any = V, DV extends any = V>({
  hook,
  name,
  label,
  labelAsIs,
  disabled,
  readOnly,
  required,
  refs,
  hideClearButton,
  hideMessage,
  tabIndex,
  defaultValue,
  dataItem: $dataItem,
  preventCollectForm,
  autoFocus,
  onChange,
  onEdit,
  ...props
}: FormItemOptions<D, V, any, DV>,
  cp: FormItemCoreArgs<SD, D, V, IV>
) => {
  const id = useId();
  const form = use(FormContext);
  const $disabled = disabled || form.disabled;
  const $readOnly = readOnly || form.processing;

  const { dataItem, $label } = useMemo(() => {
    const $name = name || $dataItem?.name;
    const $required = required ?? $dataItem?.required;
    const l = label ?? $dataItem?.label;
    const $label = (l ? env.lang(l) : "") || labelAsIs || $dataItem?.labelAsIs || $dataItem?.name;
    const $refs = (() => {
      const ret = [...(refs ?? []), ...($dataItem?.refs ?? [])];
      if (ret.length === 0) return undefined;
      return ret;
    })();
    return {
      dataItem: {
        name: $name,
        required: $required,
        label: $label,
        labelAsIs: $label,
        refs: $refs,
        validations: $dataItem?.validations,
        ...cp.getDataItem({
          name,
          label: l,
          required,
          refs: $refs,
          dataItem: $dataItem,
        }, $label),
      } as unknown as SD,
      $label,
    };
  }, [
    name,
    typeof required === "function" ? "" : required,
    ...cp.dataItemDeps,
    ...(refs ?? []),
  ]);

  const { parseVal, validation } = useMemo(() => {
    return {
      parseVal: cp.parse({ dataItem, env, label: $label }),
      validation: cp.validation({
        dataItem,
        env,
        label: $label,
        iterator: (funcs, arg) => {
          let r: DataItem.ValidationResult | null | undefined;
          for (const func of funcs) {
            r = func(arg);
            if (r?.type === "e") return r;
          }
          return r;
        }
      })
    };
  }, [dataItem]);

  const getSiblings = () => {
    const mountedItems = form.getMountedItems();
    return Object.keys(mountedItems).map(id => mountedItems[id].dataItem);
  };

  const doValidation = (v: IV | null | undefined) => {
    return validation(v, {
      value: (cp.revert ? cp.revert(v) : v) as DataItem.ValueType<SD>,
      data: form.bind,
      dataItem,
      siblings: getSiblings(),
      fullName: dataItem.name || "",
      env,
    });
  };

  const init = useMemo(() => {
    let def = false;
    const v = (() => {
      if (dataItem.name && form.process !== "nothing") {
        const [v, has] = get(form.bind, dataItem.name);
        if (has) return v;
      }
      def = true;
      return defaultValue;
    })();
    const [val, parseRes] = parseVal({
      value: v,
      dataItem,
      fullName: dataItem.name || "",
      data: form.bind,
      env,
    }, { bind: true });
    return {
      val,
      msg: (parseRes?.type === "e" ? undefined : doValidation(val)) ?? parseRes,
      default: def && defaultValue != null && defaultValue !== "",
      mount: 0,
    };
  }, []);

  const [msg, setMsg, msgRef] = useRefState<DataItem.ValidationResult | null | undefined>(init.msg);
  const [val, setVal, valRef] = useRefState<IV | null | undefined>(init.val);
  // const [_inputted, setInputted, _inputtedRef] = useRefState(false);

  const getDynamicRequired = () => {
    if (typeof dataItem.required !== "function") return false;
    return dataItem.required({
      value: valRef.current,
      data: form.bind,
      dataItem,
      fullName: dataItem.name || "",
      siblings: getSiblings(),
      env,
    });
  };
  const [dyanmicRequired, setDyanmicRequired] = useState(getDynamicRequired);

  const setState = (state: DataItem.ValidationResult | null | undefined) => {
    if (msgRef.current?.type === state?.type && msgRef.current?.msg === state?.msg) return;
    setMsg(state);
  };

  const setValueImpl = ({ v, before, res, eq, edit, updateBind }: { v: any; before: any; res: DataItem.ValidationResult | null | undefined; eq: boolean; edit: boolean; updateBind: boolean; }) => {
    if (!eq || updateBind) {
      if (form.process !== "nothing") {
        if (cp.setBind) {
          cp.setBind({
            value: v,
            name: dataItem.name,
            data: form.bind,
            dataItem,
          });
        } else {
          if (dataItem.name) set(form.bind, dataItem.name, v);
        }
      }
      setVal(v);
    }
    form.change(id);

    if (!eq) {
      onChange?.(v, { before });
      if (edit) {
        onEdit?.(v, { before });
        // setInputted(true);
      }
    }
    $.current.hook?.([v, res]);
  };

  const setValue = ({ value, edit, effect, parse, init, mount, bind }: FormItemSetArg) => {
    let v: IV | null | undefined = value;
    let parseRes: DataItem.ValidationResult | null | undefined;
    if (parse) {
      const [val, msg] = parseVal({
        value,
        dataItem,
        fullName: dataItem.name || "",
        data: form.bind,
        env,
      }, { bind: bind ?? false });
      v = val;
      parseRes = msg;
    }

    let updateBind = false;
    switch (init) {
      case "default":
        $.current.cache = undefined;
        updateBind = true;
        break;
      case true:
        $.current.cache = v;
        updateBind = true;
        break;
      default: break;
    }

    const before = valRef.current;
    const eq = (cp.equals ?? equals)(before, v, { dataItem });
    if (!eq || mount || updateBind) {
      const res = (parseRes?.type === "e" ? undefined : doValidation(v)) ?? parseRes;
      setState(res);
      setValueImpl({ v, before, edit: edit === true, eq, res, updateBind });
    }
    cp.effect({
      value: v,
      edit,
      effect,
      parse,
      init,
      origin: value,
      dataItem,
      mount,
    });
  };

  const reset = (edit?: boolean) => setValue({
    value: defaultValue,
    edit,
    parse: true,
    effect: true,
    init: (defaultValue == null || defaultValue === "") ? true : "default",
  });

  const clear = (edit?: boolean) => setValue({
    value: undefined,
    edit,
    parse: true,
    effect: true,
  });

  const $ = useRef<{
    cache: IV | null | undefined;
    doValidation: typeof doValidation;
    getDynamicRequired: typeof getDynamicRequired;
    set: typeof setValue;
    reset: typeof reset;
    getTieInNames?: typeof cp["getTieInNames"];
    hook: ReturnType<Exclude<typeof hook, undefined>> | null;
    hasChanged: typeof hasChanged;
    bind: typeof form.bind;
  }>({
    cache: init.default ? undefined : init.val,
  } as any);

  $.current.doValidation = doValidation;
  $.current.getDynamicRequired = getDynamicRequired;
  $.current.set = setValue;
  $.current.reset = reset;
  $.current.getTieInNames = cp.getTieInNames;
  $.current.hook = hook ? hook({
    get: () => valRef.current,
    set: (p) => form.setValue(name!, p.value, true),
    clear,
    reset,
    focus: cp.focus,
  }) : null;

  const hasChanged = () => !(cp.equals ?? equals)($.current.cache, valRef.current, { dataItem });
  const mountValue = !preventCollectForm && hasChanged();
  $.current.hasChanged = hasChanged;

  useLayoutEffect(() => {
    const { unmount } = form.mount({
      id,
      name: dataItem.name,
      tieInNames: $.current.getTieInNames?.({ dataItem }),
      get: () => valRef.current as any,
      set: (...args) => $.current.set(...args),
      reset: (...args) => $.current.reset(...args),
      hasChanged: (...args) => $.current.hasChanged(...args),
      getState: () => msgRef.current,
      changeRefs: () => {
        setState($.current.doValidation(valRef.current));
        setDyanmicRequired($.current.getDynamicRequired());
      },
      dataItem,
      preventCollectForm,
      autoFocus,
    });
    return () => {
      unmount();
    };
  }, [dataItem, preventCollectForm]);

  useEffect(() => {
    if (init.mount === 0) {
      init.mount++;
      $.current.bind = form.bind;
      cp.effect({
        dataItem,
        effect: true,
        value: valRef.current,
        origin: valRef.current,
      });
      return;
    }
    if ($.current.bind === form.bind) return;
    $.current.bind = form.bind;
    // setInputted(false);
    if (dataItem.name && form.process !== "nothing") {
      const [v, has] = get(form.bind, dataItem.name);
      if (has) {
        setValue({
          value: v,
          parse: true,
          effect: true,
          init: true,
          bind: true,
        });
        return;
      }
    }
    setValue({
      value: defaultValue,
      parse: true,
      effect: true,
      init: (defaultValue == null || defaultValue === "") ? true : "default",
      bind: true,
    });
  }, [form.bind]);

  useEffect(() => {
    if (init.mount === 1) {
      init.mount++;
      setValueImpl({
        v: valRef.current,
        before: undefined,
        eq: (cp.equals ?? equals)(undefined, valRef.current, { dataItem }),
        edit: false,
        res: msg,
        updateBind: true,
      });
      return;
    }
    if (cp.revert) {
      setValue({
        value: cp.revert(valRef.current),
        parse: true,
        mount: true,
        bind: true,
      });
      return;
    }
    setValue({
      value: valRef.current,
      parse: false,
      mount: true,
      bind: true,
    });
  }, [validation, parseVal]);

  const editable = !$readOnly && !$disabled && !form.processing;
  const $required = typeof dataItem.required === "function" ? dyanmicRequired : dataItem.required;
  const showButtons = !$disabled;

  const errMsgId = (!hideMessage && msg?.type === "e" && !$disabled) ? `${id}_err` : undefined;

  return {
    name: dataItem.name,
    label,
    tabIndex,
    mountValue,
    disabled: $disabled,
    readOnly: $readOnly,
    editable,
    // required: $required,
    // hideClearButton,
    // hideMessage,
    showButtons,
    // defaultValue,
    dataItem,
    // cache,
    value: val,
    valueRef: valRef,
    // onChange,
    // onEdit,
    form,
    // get,
    set: setValue,
    // reset,
    clear,
    autoFocus,
    props,
    iptAria: {
      "aria-label": $label,
      "aria-invalid": editable && msg?.type === "e",
      "aria-errormessage": errMsgId,
      "aria-required": $required,
    },
    // message: msg,
    messageComponent: (errMsgId &&
      <span
        className="ipt-msg"
        data-state={msg!.type}
        id={errMsgId}
      >
        {msg!.msg}
      </span>
    ),
    errMsgId,
    clearButton: (clear: (() => void) | undefined) => (
      !hideClearButton && showButtons &&
      <button
        className="ipt-btn ipt-clear"
        type="button"
        tabIndex={-1}
        disabled={!editable || !clear}
        onClick={clear}
      >
        <CrossIcon />
      </button>
    ),
  } as const;
};

export const useFormItem = <T extends any = any>(): FormItemHook<T> => {
  const [value, setVal] = useState<T | DataItem.NullValue>(undefined);
  const [message, setMsg] = useState<DataItem.ValidationResult | null | undefined>(undefined);
  const con = useRef<FormItemHookConnectionParams<T> | null>(null);
  const set = useCallback((v: T | DataItem.NullValue, edit: boolean) => con.current?.set({ value: v, edit, effect: true }), []);

  return {
    value,
    setValue: set,
    message,
    focus: () => con.current?.focus(),
    hook: (c) => {
      con.current = c;
      return ([v, r]) => {
        setVal(v);
        setMsg(r);
      };
    },
  } as const;
};

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
