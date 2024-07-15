"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormContext } from ".";
import { equals } from "../../../objects";
import { generateUuidV4 } from "../../../objects/string";
import { getValue, setValue } from "../../../objects/struct";
import { useRefState } from "../../hooks/ref-state";

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
  parse: (params: { dataItem: SD; }) => (props: DataItem.ParseProps<SD>) => DataItem.ParseResult<IV>;
  revert?: (v: IV | null | undefined) => (V | null | undefined);
  equals?: (v1: IV | null | undefined, v2: IV | null | undefined) => boolean;
  validation: (props: {
    dataItem: DataItem.ArgObject<SD>;
    iterator: (funcs: Array<DataItem.Validation<any>>, arg: DataItem.ValidationProps<SD, any>) => (DataItem.ValidationResult | null | undefined);
  }) => (v: IV | null | undefined, arg: DataItem.ValidationProps<SD, any>) => (DataItem.ValidationResult | null | undefined);
  setBind?: (props: {
    value: IV | null | undefined;
    name: string;
    data: { [v: string]: any };
    dataItem: DataItem.ArgObject<SD>;
  }) => void;
  effect: (props: FormItemSetArg<IV> & {
    origin: any | null | undefined;
    dataItem: DataItem.ArgObject<SD>;
  }) => void;
  focus: () => void;
};

const getId = crypto.randomUUID?.bind(crypto) ?? generateUuidV4;

export const useFormItemCore = <
  SD extends DataItem.$object,
  D extends SD | undefined,
  V extends any,
  IV extends any = V
>({
    hook,
    name,
    label,
    placeholder,
    disabled,
    readOnly,
    required,
    refs,
    hideClearButton,
    hideMessage,
    tabIndex,
    defaultValue,
    dataItem: $dataItem,
    onChange,
    onEdit,
    ...props
  }: FormItemOptions<D, V, any>,
    cp: FormItemCoreArgs<SD, D, V, IV>
  ) => {
  const id = useRef(getId());
  const form = use(FormContext);
  const hookRef = useRef<ReturnType<FormItemHook<IV>["hook"]> | null>(null);
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
      ...cp.getDataItem({
        name,
        label,
        required,
        refs: $refs,
        dataItem: $dataItem,
      }),
    } as SD;
  }, [name, typeof required === "function" ? "" : required, ...cp.dataItemDeps, ...(refs ?? [])]);

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
        const [v, has] = getValue(form.bind, dataItem.name);
        if (has) return v;
        setValue(form.bind, dataItem.name, defaultValue);
      }
      def = true;
      return defaultValue;
    })();
    const [val, parseRes] = parseVal({ value: v, dataItem, fullName: dataItem.name || "" });
    const validRes = parseRes?.type === "e" ? undefined : doValidation(val);
    return { val, msg: validRes ?? parseRes, default: def && defaultValue != null && defaultValue !== "" };
  }, []);

  const [msg, setMsg] = useState<DataItem.ValidationResult | null | undefined>(init.msg);
  const [val, setVal, valRef] = useRefState<IV | null | undefined>(init.val);
  const cache = useRef<IV | null | undefined>(init.default ? undefined : init.val);
  const [_inputted, setInputted, _inputtedRef] = useRefState(init.default);

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

  const hasChanged = () => !(cp.equals ?? equals)(cache.current, valRef.current);
  const mountValue = hasChanged();

  const setState = (state: DataItem.ValidationResult | null | undefined) => {
    form.setItemState({
      id: id.current,
      state,
    });
    setMsg(cur => {
      if (cur?.type === state?.type && cur?.msg === state?.msg) return cur;
      return state;
    });
  };

  const get = () => valRef.current as any;

  const set = ({ value, edit, effect, parse, init }: FormItemSetArg) => {
    const before = valRef.current;
    let v: IV | null | undefined = value;
    let parseRes: DataItem.ValidationResult | null | undefined;
    if (parse) {
      const [val, msg] = parseVal({ value, dataItem, fullName: dataItem.name || "" });
      v = val;
      parseRes = msg;
    }
    if (!(cp.equals ?? equals)(before, v)) {
      const validRes = parseRes?.type === "e" ? undefined : doValidation(v);
      const res = validRes ?? parseRes;
      setState(res);

      if (dataItem.name && form.state !== "nothing") {
        if (cp.setBind) {
          cp.setBind({
            value: v,
            name: dataItem.name,
            data: form.bind,
            dataItem,
          });
        } else {
          setValue(form.bind, dataItem.name, v);
        }
      }
      switch (init) {
        case "default":
          cache.current = undefined;
          break;
        case true:
          cache.current = v;
          break;
        default: break;

      }
      setVal(v);
      form.change(dataItem.name);

      onChange?.(v, { before });
      if (edit) {
        onEdit?.(v, { before });
        setInputted(true);
      }
      hookRef.current?.([v, res]);
    }
    cp.effect({ value: v, edit, effect, parse, init, origin: value, dataItem });
  };

  const reset = (edit?: boolean) => set({ value: defaultValue, edit, parse: true, effect: true });

  const clear = (edit?: boolean) => set({ value: undefined, edit, parse: true, effect: true });

  hookRef.current = hook ? hook({
    get,
    set: (p) => set({ ...p, parse: true }),
    clear,
    reset,
    focus: cp.focus,
  }) : null;

  useEffect(() => {
    const { unmount } = form.mount({
      id: id.current,
      name: dataItem.name,
      get,
      set,
      reset,
      hasChanged,
      changeRefs: () => {
        setState(doValidation(valRef.current));
        setDyanmicRequired(getDynamicRequired());
      },
      dataItem,
    });
    return () => {
      unmount();
    };
  }, [dataItem]);

  useEffect(() => {
    setInputted(false);
    if (dataItem.name && form.state !== "nothing") {
      const [v, has] = getValue(form.bind, dataItem.name);
      if (has) {
        set({ value: v, parse: true, effect: true, init: true });
        return;
      }
    }
    set({ value: defaultValue, parse: true, effect: true, init: (defaultValue == null || defaultValue === "") ? true : "default" });
  }, [form.bind, dataItem]);

  useEffect(() => {
    if (cp.revert) {
      set({ value: cp.revert(valRef.current), parse: false });
      return;
    }
    set({ value: valRef.current, parse: true });
  }, [validation, parseVal]);

  const editable = !$readOnly && !$disabled && !form.pending;
  const $required = typeof dataItem.required === "function" ? dyanmicRequired : dataItem.required;
  const showButtons = !$disabled;

  return {
    name: dataItem.name,
    label,
    placeholder,
    tabIndex,
    mountValue,
    disabled: $disabled,
    readOnly: $readOnly,
    editable,
    required: $required,
    hideClearButton,
    hideMessage,
    showButtons,
    // defaultValue,
    dataItem,
    value: val,
    valueRef: valRef,
    // onChange,
    // onEdit,
    form,
    get,
    set,
    reset,
    clear,
    props,
    airaProps: {
      "data-required": $required,
      "data-disabled": disabled || form.disabled,
      "data-readonly": readOnly || form.pending,
      "data-invalid": editable && msg?.type === "e",
      "data-label": $dataItem?.label,
      "data-placeholder": placeholder,
      "data-changed": mountValue,
    },
    message: msg,
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
        className="ipt-btn"
        tabIndex={-1}
        data-disabled={!editable || !clear}
        onClick={clear}
      >
        ×
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
    hook: (c) => {
      con.current = c;
      return ([v, r]) => {
        setVal(v);
        setMsg(r);
      };
    },
  } as const;
};
