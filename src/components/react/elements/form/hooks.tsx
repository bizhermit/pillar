import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormContext } from ".";
import { getValue, setValue } from "../../../objects/struct";
import { useRefState } from "../../hooks/ref-state";

type FormItemCoreArgs<
  SD extends DataItem.$object,
  D extends SD | undefined,
  V extends any,
  IV extends any = V
> = {
  dataItemDeps: Array<any>;
  getDataItem: (props: {
    name: string | undefined;
    label: string | undefined;
    required: boolean | undefined;
    dataItem: D | undefined;
  }) => DataItem.ArgObject<SD>;
  parse: (params: { dataItem: SD; }) => (props: DataItem.ParseProps<SD>) => DataItem.ParseResult<IV>;
  validation: (props: {
    dataItem: DataItem.ArgObject<SD>;
    iterator: (funcs: Array<DataItem.Validation<any>>, arg: Parameters<DataItem.Validation<any>>[0]) => (DataItem.ValidationResult | null | undefined);
  }) => (v: IV | null | undefined, arg: Parameters<DataItem.Validation<SD>>[0]) => (DataItem.ValidationResult | null | undefined);
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
  const id = useRef(crypto.randomUUID());
  const form = use(FormContext);
  const hookRef = useRef<ReturnType<FormItemHook<IV>["hook"]> | null>(null);

  const dataItem = useMemo(() => {
    const $name = name || $dataItem?.name;
    const $required = required ?? $dataItem?.required;
    const $label = label || $dataItem?.label;
    return {
      name: $name,
      required: $required,
      label: $label,
      ...cp.getDataItem({
        name,
        label,
        required,
        dataItem: $dataItem,
      }),
    } as SD;
  }, [name, required, ...cp.dataItemDeps]);

  const { parse, validation } = useMemo(() => {
    return {
      parse: cp.parse({ dataItem }),
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
      value: v as DataItem.ValueType<SD>,
      data: form.bind,
      dataItem,
      siblings: getSiblings(),
      fullName: dataItem.name || "",
    });
  };

  const init = useMemo(() => {
    const v = (() => {
      if (dataItem.name && form.state !== "nothing") {
        const [v, has] = getValue(form.bind, dataItem.name);
        if (has) return v;
      }
      return defaultValue;
    })();
    const [val, parseRes] = parse({ value: v, dataItem, fullName: dataItem.name || "" });
    const validRes = parseRes?.type === "e" ? undefined : doValidation(val);
    return { val, msg: validRes ?? parseRes };
  }, []);

  const [msg, setMsg] = useState<DataItem.ValidationResult | null | undefined>(init.msg);
  const [val, setVal, valRef] = useRefState<IV | null | undefined>(init.val);

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

  const set = ({ value, edit }: FormItemSetArg) => {
    const before = valRef.current;
    let v: IV | null | undefined = value;
    let parseRes: DataItem.ValidationResult | null | undefined;
    if (!edit) {
      const [val, msg] = parse({ value, dataItem, fullName: dataItem.name || "" });
      v = val;
      parseRes = msg;
    }
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
    setVal(v);

    onChange?.(v, { before });
    if (edit) onEdit?.(v, { before });
    cp.effect({ value: v, edit, origin: value, dataItem });
    hookRef.current?.([v, res]);

    return [v, res];
  };

  const reset = () => set({ value: defaultValue, edit: false });

  const clear = () => set({ value: undefined, edit: false });

  hookRef.current = hook ? hook({
    get,
    set: (value) => set({ value, edit: false }),
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
      dataItem,
    });
    return () => {
      unmount();
    };
  }, []);

  useEffect(() => {
    if (dataItem.name && form.state !== "nothing") {
      const [v, has] = getValue(form.bind, dataItem.name);
      if (has) {
        set({ value: v, edit: false });
        return;
      }
    }
    set({ value: defaultValue, edit: false });
  }, [form.bind]);

  useEffect(() => {
    set({ value: valRef.current, edit: true });
  }, [validation]);

  const editable = !readOnly && !(disabled || form.disabled);

  return {
    name: dataItem.name,
    label,
    placeholder,
    tabIndex,
    disabled: disabled || form.disabled,
    readOnly,
    editable,
    required: dataItem.required,
    hideClearButton,
    hideMessage,
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
      "aria-required": required,
      "aria-disabled": disabled || form.disabled,
      "aria-readonly": readOnly || form.pending,
      "aria-invalid": editable && msg?.type === "e",
      "aria-label": $dataItem?.label,
      "aria-placeholder": placeholder,
    },
    message: msg,
    messageComponent: (!hideMessage && msg && editable &&
      <span
        className="ipt-msg"
        data-state={msg.type}
      >
        {msg.msg}
      </span>
    ),
  } as const;
};

export const useFormItem = <T extends any = any>(): FormItemHook<T> => {
  const [value, setVal] = useState<T | DataItem.NullValue>(undefined);
  const [message, setMsg] = useState<DataItem.ValidationResult | null | undefined>(undefined);
  const con = useRef<FormItemHookConnectionParams<T> | null>(null);
  const set = useCallback((v: T | DataItem.NullValue) => con.current?.set(v), []);

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
