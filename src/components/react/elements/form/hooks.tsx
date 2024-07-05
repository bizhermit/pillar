import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormContext } from ".";
import { getValue, setValue } from "../../../objects/struct";
import { useRefState } from "../../hooks/ref-state";

type FormItemCoreProps<A extends DataItem.$object, D extends A> = {
  dataItemDeps: Array<any>;
  getDataItem: (props: {
    name: string | undefined;
    label: string | undefined;
    required: boolean | undefined;
    dataItem: D | null | undefined;
  }) => DataItem.ArgObject<A>;
  parse: (props: DataItem.ParseProps<A>) => DataItem.ParseResult<any>;
  effect: (props: FormItemSetArg<A> & {
    origin: any | null | undefined;
    dataItem: DataItem.ArgObject<A>;
  }) => void;
  validations: (props: {
    dataItem: DataItem.ArgObject<A>;
  }) => Array<DataItem.Validation<A>>;
  focus: () => void;
};

export const useFormItemCore = <A extends DataItem.$object, D extends A>({
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
  dataItem,
  onChange,
  onEdit,
  ...props
}: FormItemOptions<D>, cp: FormItemCoreProps<A, D>) => {
  const id = useRef(crypto.randomUUID());
  const form = use(FormContext);
  const hookSetter = useRef<((v: DataItem.ValueType<D> | DataItem.NullValue) => void) | null>(null);

  const $dataItem = useMemo(() => {
    const $name = name || dataItem?.name;
    const $required = required ?? dataItem?.required;
    const $label = label || dataItem?.label;
    return {
      name: $name,
      required: $required,
      label: $label,
      ...cp.getDataItem({
        name,
        label,
        required,
        dataItem,
      }),
    };
  }, [name, required, ...cp.dataItemDeps]);

  const parseAndValidation = useMemo(() => {
    const validations = cp.validations({ dataItem: $dataItem });

    return (v: DataItem.ValueType<D> | DataItem.NullValue, preventSetState?: boolean) => {
      const [value, parseResult] = cp.parse({ value: v, dataItem: $dataItem, fullName: $dataItem.name || "" });
      const parseError = parseResult?.type === "e" ? parseResult : undefined;
      let validationResult: DataItem.ValidationResult | DataItem.NullValue;
      if (!parseError) {
        const mountedItems = form.getMountedItems();
        const siblings = Object.keys(mountedItems).map(id => mountedItems[id].dataItem);
        for (const func of validations) {
          validationResult = func({
            value,
            data: form.bind,
            dataItem: $dataItem,
            siblings,
            fullName: $dataItem.name || "",
          });
          if (validationResult?.type === "e") break;
        }
      }

      const result = parseError ?? validationResult;
      if (!preventSetState) setState(result);
      return [value, result] as const;
    };
  }, [$dataItem]);

  const init = useMemo(() => {
    const initValue = (() => {
      if ($dataItem.name && form.state !== "nothing") {
        const [v, has] = getValue(form.bind, $dataItem.name);
        if (has) return v;
      }
      return defaultValue;
    })();
    const [value, message] = parseAndValidation(initValue, true);
    return { value, message };
  }, []);

  const [message, setMessage] = useState<DataItem.ValidationResult | null | undefined>(init.message);

  const setState = (state: DataItem.ValidationResult | null | undefined) => {
    form.setItemState({
      id: id.current,
      state,
    });
    setMessage(cur => {
      if (cur?.type === state?.type && cur?.msg === state?.msg) return cur;
      return state;
    });
  };

  const [val, setVal, valRef] = useRefState(init.value);

  const get = () => valRef.current as any;

  const set = ({ value, edit }: FormItemSetArg<D>) => {
    const before = valRef.current;
    const [v] = parseAndValidation(value);
    if ($dataItem.name && form.state !== "nothing") {
      setValue(form.bind, $dataItem.name, v);
    }
    setVal(v);
    onChange?.(v, { before });
    if (edit) onEdit?.(v, { before });
    cp.effect({ value: v, edit, origin: value, dataItem: $dataItem });
    hookSetter.current?.(v);
    return v;
  };

  const reset = () => set({ value: defaultValue, edit: false });

  const clear = () => set({ value: undefined, edit: false });

  hookSetter.current = hook ? hook({
    get,
    set: (v) => set({ value: v, edit: false }),
    clear,
    reset,
    focus: cp.focus,
  }) : null;

  useEffect(() => {
    const { unmount } = form.mount({
      id: id.current,
      name: $dataItem.name,
      get,
      set,
      reset,
      dataItem: $dataItem,
    });
    return () => {
      unmount();
    };
  }, []);

  useEffect(() => {
    if ($dataItem.name && form.state !== "nothing") {
      const [v, has] = getValue(form.bind, $dataItem.name);
      if (has) {
        set({ value: v, edit: false });
        return;
      }
    }
    set({ value: defaultValue, edit: false });
  }, [form.bind]);

  useEffect(() => {
    parseAndValidation(valRef.current);
  }, [parseAndValidation, form.bind]);

  return {
    name: $dataItem.name,
    label,
    placeholder,
    tabIndex,
    disabled: disabled || form.disabled,
    readOnly,
    editable: !readOnly && !(disabled || form.disabled),
    required: $dataItem.required,
    hideClearButton,
    hideMessage,
    // defaultValue,
    dataItem: $dataItem,
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
      "aria-invalid": message?.type === "e",
      "aria-label": $dataItem?.label,
      "aria-placeholder": placeholder,
    },
    message,
    messageComponent: (!hideMessage && message &&
      <span
        className="ipt-msg"
        data-state={message.type}
      >
        {message.msg}
      </span>
    ),
  } as const;
};

export const useFormItem = <T extends any = any>(): FormItemHook<T> => {
  const [value, setV] = useState<T | DataItem.NullValue>(undefined);
  const con = useRef<FormItemHookConnectionParams<T> | null>(null);
  const set = useCallback((v: T | DataItem.NullValue) => con.current?.set(v), []);

  return {
    value,
    setValue: set,
    hook: (c) => {
      con.current = c;
      return setV;
    },
  } as const;
};
