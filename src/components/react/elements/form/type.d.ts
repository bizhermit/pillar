type FormItemValue<V extends any = any, D extends DataItem.$objec | undefined> =
  D extends DataItem.$object ? DataItem.ValueType<D> : V;

type FormItemRefConnectionParams<IV extends any> = {
  get: () => (IV | DataItem.NullValue);
  set: (params: { value: IV | DataItem.NullValue; edit?: boolean; effect?: boolean; }) => void;
  reset: (edit?: boolean) => void;
  clear: (edit?: boolean) => void;
  focus: () => void;
};

interface FormItemRef<IV extends any> {
  (params: FormItemRefConnectionParams<IV>): ((params: [
    value: IV | DataItem.NullValue,
    result?: DataItem.ValidationResult | null | undefined,
  ]) => void);
  value: IV | DataItem.NullValue;
  setValue: (value: IV | DataItem.NullValue, edit: boolean) => void;
  message: DataItem.ValidationResult | null | undefined;
  focus: () => void;
}

type FormItemOptions<
  D extends DataItem.$object | undefined = undefined,
  V extends any,
  IV extends any = V,
  DV extends any = V
> = {
  name?: string;
  label?: LangKey;
  labelAsIs?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean | ((props: DataItem.ValidationProps<D>) => boolean);
  refs?: Array<string>;
  hideClearButton?: boolean;
  hideMessage?: boolean;
  tabIndex?: number;
  defaultValue?: V | DV | DataItem.NullValue;
  dataItem?: D;
  preventCollectForm?: boolean;
  autoFocus?: boolean;
  onChange?: (value: IV | DataItem.NullValue, params: {
    before: IV | DataItem.NullValue;
  }) => void;
  onEdit?: (value: IV | DataItem.NullValue, params: {
    before: IV | DataItem.NullValue;
  }) => void;
  ref?: FormItemRef<IV>;
};

type FormItemSetArg<T extends any = any> = {
  value: T | DataItem.NullValue;
  edit?: boolean;
  effect?: boolean;
  parse?: boolean;
  init?: boolean | "default";
  mount?: boolean;
  bind?: boolean;
};
