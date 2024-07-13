"use client";

import { useRef, type HTMLAttributes } from "react";
import { $boolParse } from "../../../../data-items/bool/parse";
import { $boolValidations } from "../../../../data-items/bool/validation";
import { equals } from "../../../../objects";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type ToggleSwitchOptions<
  True extends boolean | number | string,
  False extends boolean | number | string,
  D extends DataItem.$boolAny<True, False> | undefined
> = Omit<FormItemOptions<D, D extends DataItem.$boolAny ? DataItem.ValueType<D> : True | False>, "hideClearButton"> & {
  trueValue?: True;
  falseValue?: False;
  requiredIsTrue?: boolean;
};

type ToggleSwitchProps<True extends boolean | number | string, False extends boolean | number | string, D extends DataItem.$boolAny<True, False> | undefined> =
  OverwriteAttrs<HTMLAttributes<HTMLLabelElement>, ToggleSwitchOptions<True, False, D>>

export const ToggleSwitch = <True extends boolean | number | string, False extends boolean | number | string, D extends DataItem.$boolAny<True, False> | undefined>({
  requiredIsTrue,
  ...props
}: ToggleSwitchProps<True, False, D>) => {
  const iref = useRef<HTMLInputElement>(null!);

  const {
    trueValue,
    falseValue,
    ...$props
  } = props;

  const fi = useFormItemCore<DataItem.$boolAny<True, False>, D, True | False, True | False>($props, {
    dataItemDeps: [trueValue, falseValue, requiredIsTrue],
    getDataItem: ({ dataItem }) => {
      const tv = trueValue ?? dataItem?.trueValue;
      const fv = falseValue ?? dataItem?.falseValue;
      if (dataItem?.type) {
        return {
          type: dataItem.type,
          trueValue: tv as True,
          falseValue: fv as False,
          requiredIsTrue: requiredIsTrue ?? dataItem.requiredIsTrue,
        } as DataItem.$boolAny<True, False>;
      }
      const hasTrue = "trueValue" in props;
      const hasFalse = "falseValue" in props;
      switch (typeof (tv ?? fv)) {
        case "number":
          return {
            type: "b-num",
            trueValue: hasTrue ? tv : (tv ?? 1),
            falseValue: hasFalse ? fv : (fv ?? 0),
            requiredIsTrue,
          } as DataItem.$boolAny<True, False>;
        case "string":
          return {
            type: "b-str",
            trueValue: hasTrue ? tv : (tv ?? "1"),
            falseValue: hasFalse ? fv : (fv ?? "0"),
            requiredIsTrue,
          } as DataItem.$boolAny<True, False>;
        default:
          return {
            type: "bool",
            trueValue: hasTrue ? tv : (tv ?? true),
            falseValue: hasFalse ? fv : (fv ?? false),
            requiredIsTrue,
          } as DataItem.$boolAny<True, False>;
      }
    },
    parse: () => $boolParse,
    effect: ({ value, edit, dataItem, effect }) => {
      if (iref.current && (!edit || effect)) iref.current.checked = equals(dataItem.trueValue, value);
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $boolValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: () => iref.current?.focus(),
  });

  return (
    <>
      <label
        {...fi.props}
        {...fi.airaProps}
        tabIndex={fi.editable ? -1 : undefined}
        className={joinClassNames("ipt-lbl", props.className)}
        data-children={props.children != null}
      >
        <input
          ref={iref}
          className="ipt-tgl"
          type="checkbox"
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          checked={equals(fi.dataItem.trueValue, fi.value)}
          onChange={e => {
            if (!fi.editable) return;
            fi.set({ value: e.target.checked ? fi.dataItem.trueValue : fi.dataItem.falseValue, edit: true });
          }}
          data-invalid={fi.airaProps["data-invalid"]}
        />
        {fi.name && fi.mountValue &&
          <input
            name={fi.name}
            type="hidden"
            value={String(fi.value ?? "")}
            disabled={fi.disabled}
          />
        }
        {props.children}
      </label>
      {fi.messageComponent}
    </>
  );
};
