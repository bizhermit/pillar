type FormItemValue<V extends any = any, D extends DataItem.$objec | undefined> =
  D extends DataItem.$object ? DataItem.ValueType<D> : V;

type FormItemHookConnectionParams<IV extends any> = {
  get: () => (IV | DataItem.NullValue);
  set: (value: IV | DataItem.NullValue) => void;
  reset: () => void;
  clear: () => void;
  focus: () => void;
};

type FormItemHook<IV extends any> = {
  value: IV | DataItem.NullValue;
  setValue: (value: IV | DataItem.NullValue) => void;
  message: DataItem.ValidationResult | null | undefined;
  hook: (params: FormItemHookConnectionParams<IV>) => (params: [
    value: IV | DataItem.NullValue,
    result?: DataItem.ValidationResult | null | undefined,
  ]) => void;
};

type FormItemOptions<
  D extends DataItem.$object | undefined = undefined,
  V extends any,
  IV extends any = V,
> = {
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hideClearButton?: boolean;
  hideMessage?: boolean;
  tabIndex?: number;
  defaultValue?: V | DataItem.NullValue;
  dataItem?: D;
  onChange?: (value: IV | DataItem.NullValue, params: {
    before: IV | DataItem.NullValue;
  }) => void;
  onEdit?: (value: IV | DataItem.NullValue, params: {
    before: IV | DataItem.NullValue;
  }) => void;
  hook?: FormItemHook<IV>["hook"];
};

type FormItemSetArg<T extends any = any> = {
  value: T | DataItem.NullValue;
  edit: boolean;
};
