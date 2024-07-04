type FormItemHookConnectionParams<T extends any> = {
  get: () => (T | DataItem.NullValue);
  set: (value: T | DataItem.NullValue) => void;
  reset: () => void;
  clear: () => void;
  focus: () => void;
};

type FormItemHook<T extends any> = {
  value: T | DataItem.NullValue;
  setValue: (value: T | DataItem.NullValue) => void;
  hook: (params: FormItemHookConnectionParams<T>) => ((value: T | DataItem.NullValue) => void);
};

type FormItemOptions<D extends DataItem.$object> = {
  ref?: React.MutableRefObject<HTMLDivElement>;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hideClearButton?: boolean;
  hideMessage?: boolean;
  tabIndex?: number;
  defaultValue?: DataItem.ValueType<D> | DataItem.NullValue;
  dataItem?: D;
  onChange?: (value: DataItem.ValueType<D> | DataItem.NullValue, params: {
    before: DataItem.ValueType<D> | DataItem.NullValue;
  }) => void;
  onEdit?: (value: DataItem.ValueType<D> | DataItem.NullValue, params: {
    before: DataItem.ValueType<D> | DataItem.NullValue;
  }) => void;
  hook?: FormItemHook<DataItem.ValueType<D>>["hook"];
};

type FormItemSetArg<D extends DataItem.$object> = {
  value: DataItem.ValueType<D> | DataItem.NullValue;
  edit: boolean;
};
