import { $numParse } from "@/data-items/number/parse";
import { $numValidations } from "@/data-items/number/validation";
import { HTMLAttributes, useRef } from "react";
import { useFormItemCore } from "../hooks";

type SliderOptions<D extends DataItem.$num | undefined> = FormItemOptions<D, D extends DataItem.$num ? DataItem.ValueType<D> : number> & {
  min?: number;
  max?: number;
  requiredIsNotZero?: boolean;
  step?: number;
};

type SliderProps<D extends DataItem.$num | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, SliderOptions<D>>;

export const Slider = <D extends DataItem.$num | undefined>({
  min,
  max,
  requiredIsNotZero,
  step,
  ...props
}: SliderProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);

  const fi = useFormItemCore<DataItem.$num, D, number, number>(props, {
    dataItemDeps: [min, max, requiredIsNotZero],
    getDataItem: ({ dataItem }) => {
      return {
        type: "num",
        min: min ?? dataItem?.min,
        max: max ?? dataItem?.max,
        requiredIsNotZero: requiredIsNotZero ?? dataItem?.requiredIsNotZero,
      };
    },
    parse: () => $numParse,
    effect: ({ edit, value }) => {
      // if (!edit && iref.current) iref.current.value = value;
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $numValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: () => iref.current?.focus(),
  });

  const empty = fi.value == null || Number.isNaN(fi.value);

  return (
    <div
      {...fi.props}
      {...fi.airaProps}
    >
      <input
        ref={iref}
        className="ipt-slider"
        type="range"
        name={empty ? undefined : fi.name}
        disabled={fi.disabled}
        readOnly={fi.readOnly || fi.form.pending}
        tabIndex={fi.tabIndex}
        min={fi.dataItem.min}
        max={fi.dataItem.max}
        step={step ?? 1}
        aria-invalid={fi.airaProps["aria-invalid"]}
      />
    </div>
  );
};
