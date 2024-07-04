import { useRefState } from "@/react/hooks/ref-state";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { FormContext } from ".";
import { getValue, setValue } from "../../../objects/struct";

type Options<D extends DataItem.$object> = {
  getDataItem: (props: {
    name: string | undefined;
    label: string | undefined;
    required: boolean | undefined;
    dataItem: D | null | undefined;
  }) => DataItem.ArgObject<D>;
  dataItemDeps: Array<any>;
  parse: (props: DataItem.ParseProps<D>) => DataItem.ParseResult<DataItem.ValueType<D>>;
  effect: (props: FormItemSetArg<D> & { origin: any | null | undefined }) => void;
  validations: (props: {
    dataItem: DataItem.ArgObject<D>;
  }) => Array<DataItem.Validation<D>>;
};

export const useFormItem = <D extends DataItem.$object>({
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
}: FormItemOptions<D>, options: Options<D>) => {
  const id = useRef(crypto.randomUUID());

  const $dataItem = useMemo(() => {
    const $name = name || dataItem?.name;
    const $required = required ?? dataItem?.required;
    const $label = label || dataItem?.label;
    return {
      name: $name,
      required: $required,
      label: $label,
      ...options.getDataItem({
        name,
        label,
        required,
        dataItem,
      }),
    };
  }, [name, required, ...options.dataItemDeps]);

  const form = use(FormContext);

  const parseAndValidation = useMemo(() => {
    const validations = options.validations({ dataItem: $dataItem });
    return (v: DataItem.ValueType<D> | null | undefined, preventSetMessage?: boolean) => {
      const [value, parseResult] = options.parse({ value: v, dataItem: $dataItem, fullName: $dataItem.name || "" });
      const parseError = parseResult?.type === "e" ? parseResult : undefined;
      let validationResult: DataItem.ValidationResult | null | undefined;
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
      if (!preventSetMessage) setMsg(result);
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

  const setMsg = (msg: DataItem.ValidationResult | null | undefined) => {
    form.setItemState({
      id: id.current,
      content: msg,
    });
    setMessage(cur => {
      if (cur?.type === msg?.type && cur?.msg === msg?.msg) return cur;
      return msg;
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
    options.effect({ value: v, edit, origin: value });
    return v;
  };

  const reset = (edit: boolean) => set({ value: defaultValue, edit });

  const clear = (edit: boolean) => set({ value: undefined, edit });

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
      "aria-disabled": disabled,
      "aria-readonly": readOnly || form.pending,
      "aria-invalid": message?.type === "e",
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
