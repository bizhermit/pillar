type FormItemOptions<D extends DataItem.$object> = {
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hideClearButton?: boolean;
  hideMessage?: boolean;
  tabIndex?: number;
  defaultValue?: DataItem.ValueType<D>;
  dataItem?: D;
  onChange?: (value: DataItem.ValueType<D> | DataItem.NullValue, params: {
    before: DataItem.ValueType<D> | DataItem.NullValue;
  }) => void;
  onEdit?: (value: DataItem.ValueType<D> | DataItem.NullValue, params: {
    before: DataItem.ValueType<D> | DataItem.NullValue;
  }) => void;
};

type FormItemSetArg<D extends DataItem.$object> = {
  value: DataItem.ValueType<D> | null | undefined;
  edit: boolean;
};
