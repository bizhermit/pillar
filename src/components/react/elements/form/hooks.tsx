"use client";

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
  }) => DataItem.ArgObject<SD>;
  getTieInNames?: (params: { dataItem: SD; }) => (Array<string> | undefined);
  parse: (params: { dataItem: SD; }) => (props: DataItem.ParseProps<SD>, args: { bind: boolean; }) => DataItem.ParseResult<IV>;
  revert?: (v: IV | null | undefined) => (V | null | undefined);
  equals?: (v1: IV | null | undefined, v2: IV | null | undefined, params: { dataItem: DataItem.ArgObject<SD>; }) => boolean;
  validation: (props: {
    dataItem: DataItem.ArgObject<SD>;
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

export const useFormItemCore = <SD extends DataItem.$object, D extends SD | undefined, V extends any, IV extends any = V>({
  hook,
  name,
  label,
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
}: FormItemOptions<D, V, any>,
  cp: FormItemCoreArgs<SD, D, V, IV>
) => {
  const id = useId();
  const form = use(FormContext);
  const $disabled = disabled || form.disabled;
  const $readOnly = readOnly || form.pending;

  const dataItem = useMemo(() => {
    const $name = name || $dataItem?.name;
    const $required = required ?? $dataItem?.required;
    const $label = label || $dataItem?.label;
    const $refs = (() => {
      const ret = [...(refs ?? []), ...($dataItem?.refs ?? [])];
      if (ret.length === 0) return undefined;
      return ret;
    })();
    return {
      name: $name,
      required: $required,
      label: $label,
      refs: $refs,
      validations: $dataItem?.validations,
      ...cp.getDataItem({
        name,
        label,
        required,
        refs: $refs,
        dataItem: $dataItem,
      }),
    } as SD;
  }, [
    name,
    typeof required === "function" ? "" : required,
    ...cp.dataItemDeps,
    ...(refs ?? []),
  ]);

  const { parseVal, validation } = useMemo(() => {
    return {
      parseVal: cp.parse({ dataItem }),
      validation: cp.validation({
        dataItem,
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
    });
  };

  const init = useMemo(() => {
    let def = false;
    const v = (() => {
      if (dataItem.name && form.state !== "nothing") {
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
    }, { bind: true });
    const validRes = parseRes?.type === "e" ? undefined : doValidation(val);
    return {
      val,
      msg: validRes ?? parseRes,
      default: def && defaultValue != null && defaultValue !== "",
      mount: 0,
    };
  }, []);

  const [msg, setMsg] = useState<DataItem.ValidationResult | null | undefined>(init.msg);
  const [val, setVal, valRef] = useRefState<IV | null | undefined>(init.val);
  const [_inputted, setInputted, _inputtedRef] = useRefState(false);

  const getDynamicRequired = () => {
    if (typeof dataItem.required !== "function") return false;
    return dataItem.required({
      value: valRef.current,
      data: form.bind,
      dataItem,
      fullName: dataItem.name || "",
      siblings: getSiblings(),
    });
  };
  const [dyanmicRequired, setDyanmicRequired] = useState(getDynamicRequired);

  const setState = (state: DataItem.ValidationResult | null | undefined) => {
    form.setItemState({ id, state });
    setMsg(cur => {
      if (cur?.type === state?.type && cur?.msg === state?.msg) return cur;
      return state;
    });
  };

  const getValue = () => valRef.current as any;

  const setValue = ({ value, edit, effect, parse, init, mount, bind }: FormItemSetArg) => {
    let v: IV | null | undefined = value;
    let parseRes: DataItem.ValidationResult | null | undefined;
    if (parse) {
      const [val, msg] = parseVal({
        value,
        dataItem,
        fullName: dataItem.name || "",
        data: form.bind,
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
      const validRes = parseRes?.type === "e" ? undefined : doValidation(v);
      const res = validRes ?? parseRes;
      setState(res);

      if (!eq || updateBind) {
        if (form.state !== "nothing") {
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
          setInputted(true);
        }
      }
      $.current.hook?.([v, res]);
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
    get: typeof getValue;
    set: typeof setValue;
    reset: typeof reset;
    getTieInNames?: typeof cp["getTieInNames"];
    hook: ReturnType<Exclude<typeof hook, undefined>> | null;
    hasChanged: typeof hasChanged;
  }>({
    cache: init.default ? undefined : init.val,
  } as any);

  $.current.doValidation = doValidation;
  $.current.getDynamicRequired = getDynamicRequired;
  $.current.get = getValue;
  $.current.set = setValue;
  $.current.reset = reset;
  $.current.getTieInNames = cp.getTieInNames;
  $.current.hook = hook ? hook({
    get: getValue,
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
      get: $.current.get,
      set: $.current.set,
      reset: $.current.reset,
      hasChanged: $.current.hasChanged,
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
    setInputted(false);
    if (init.mount === 0) {
      init.mount++;
      return;
    }
    if (dataItem.name && form.state !== "nothing") {
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
      cp.effect({
        value: valRef.current,
        effect: true,
        init: init.default ? "default" : true,
        origin: init.val,
        dataItem,
        mount: true,
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

  const editable = !$readOnly && !$disabled && !form.pending;
  const $required = typeof dataItem.required === "function" ? dyanmicRequired : dataItem.required;
  const showButtons = !$disabled;

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
    attrs: {
      "data-required": $required,
      "data-disabled": disabled || form.disabled,
      "data-readonly": readOnly || form.pending,
      "data-invalid": editable && msg?.type === "e",
      "data-label": $dataItem?.label,
      "data-changed": mountValue,
    },
    // message: msg,
    messageComponent: (!hideMessage && msg && !$disabled &&
      <span
        className="ipt-msg"
        data-state={msg.type}
      >
        {msg.msg}
      </span>
    ),
    clearButton: (clear: (() => void) | undefined) => (
      !hideClearButton && showButtons &&
      <div
        className="ipt-btn ipt-clear"
        tabIndex={-1}
        data-disabled={!editable || !clear}
        onClick={clear}
      >
        <CrossIcon />
      </div>
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
  const [value, setVal] = useState<T | undefined>(form.getValue(name));

  const set = (value: T) => {
    form.setValue(name, value);
  };

  useLayoutEffect(() => {
    const { unmount } = form.mount({
      id,
      name,
      get: () => undefined as any,
      set: () => { },
      reset: () => { },
      hasChanged: () => false,
      changeRefs: () => {
        setVal(form.getValue<T>(name));
      },
      dataItem: {
        type: "any",
        refs: [name],
      },
      preventCollectForm: true,
      noInput: true,
    });
    setVal(form.getValue(name));
    return () => {
      unmount();
    };
  }, [name]);

  return {
    value,
    setValue: set,
    initialized: form.state !== "init",
  };
};
