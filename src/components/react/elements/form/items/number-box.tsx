"use client";

import { type ChangeEvent, type HTMLAttributes, type KeyboardEvent, useRef } from "react";
import { $numParse } from "../../../../data-items/number/parse";
import { $numValidations } from "../../../../data-items/number/validation";
import { formatNum, parseNum } from "../../../../objects/number";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type NumberBoxOptions<D extends DataItem.$num | undefined> = FormItemOptions<D, D extends DataItem.$num ? DataItem.ValueType<D> : number> & {
  min?: number;
  max?: number;
  maxLength?: number;
  float?: number;
  requiredIsNotZero?: boolean;
  preventThousandSeparate?: boolean;
  step?: number;
  hideSpinButtons?: boolean;
  placeholder?: string;
};

type NumberBoxProps<D extends DataItem.$num | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, NumberBoxOptions<D>>;

export const NumberBox = <D extends DataItem.$num | undefined>({
  min,
  max,
  maxLength,
  float,
  requiredIsNotZero,
  preventThousandSeparate,
  step,
  hideSpinButtons,
  placeholder,
  ...props
}: NumberBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const focusInput = () => iref.current?.focus();

  const fi = useFormItemCore<DataItem.$num, D, number, number>(props, {
    dataItemDeps: [min, max, maxLength, float, requiredIsNotZero],
    getDataItem: ({ dataItem }) => {
      return {
        type: "num",
        min: min ?? dataItem?.min,
        max: max ?? dataItem?.max,
        maxLength: maxLength ?? dataItem?.maxLength,
        float: float ?? dataItem?.float,
        requiredIsNotZero: requiredIsNotZero ?? dataItem?.requiredIsNotZero,
      };
    },
    parse: () => $numParse,
    effect: ({ edit, value, effect }) => {
      if (iref.current && (!edit || effect)) iref.current.value = parseFormattedValue(value);
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $numValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: focusInput,
  });

  const empty = fi.value == null || Number.isNaN(fi.value);

  const minmax = (num: number | null | undefined) => {
    if (num == null) return num;
    let ret = num;
    if (fi.dataItem.min != null) ret = Math.max(fi.dataItem.min, num);
    if (fi.dataItem.max != null) ret = Math.min(fi.dataItem.max, num);
    return ret;
  };

  const renderNumberValue = () => {
    if (!iref.current) return;
    iref.current.value = formatNum(fi.valueRef.current, { fpad: fi.dataItem.float ?? 0, thou: false }) || "";
  };

  const parseFormattedValue = (v: number | null | undefined) => {
    return formatNum(v, {
      thou: !preventThousandSeparate,
      fpad: fi.dataItem.float ?? 0,
    }) ?? "";
  };

  const renderFormattedValue = () => {
    if (!iref.current) return;
    iref.current.value = parseFormattedValue(fi.valueRef.current);
  };

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const num = parseNum(e.target.value);
    if (v && num == null) {
      renderNumberValue();
      return;
    }
    fi.set({ value: num, edit: true });
  };

  const focus = () => {
    if (!fi.editable) return;
    renderNumberValue();
  };

  const blur = () => {
    renderFormattedValue();
  };

  const increment = () => {
    const v = (() => {
      if (fi.valueRef.current == null) return fi.dataItem.min ?? 0;
      return minmax(fi.valueRef.current + (step || 1));
    })();
    fi.set({ value: v, edit: true, effect: true });
  };

  const decrement = () => {
    const v = (() => {
      if (fi.valueRef.current == null) return fi.dataItem.min ?? 0;
      return minmax(fi.valueRef.current - (step || 1));
    })();
    fi.set({ value: v, edit: true, effect: true });
  };

  const keydown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowUp":
        if (fi.editable) {
          increment();
          e.preventDefault();
        }
        break;
      case "ArrowDown":
        if (fi.editable) {
          decrement();
          e.preventDefault();
        }
        break;
      default: break;
    }
  };

  const mousedown = (mode: "up" | "down") => {
    if (!fi.editable) return;
    if (mode === "up") increment();
    else decrement();
    let roop = true;
    const end = () => {
      roop = false;
      window.removeEventListener("mouseup", end);
    };
    window.addEventListener("mouseup", end);
    const func = () => {
      if (!roop) return;
      if (mode === "up") increment();
      else decrement();
      setTimeout(func, 30);
    };
    setTimeout(func, 500);
  };

  const clear = () => {
    if (!fi.editable || empty) return;
    fi.clear(true);
    focusInput();
  };

  return (
    <>
      <div
        {...fi.props}
        {...fi.attrs}
        className={joinClassNames("ipt-field", props.className)}
      >
        <input
          ref={iref}
          className="ipt-num"
          type="text"
          placeholder={fi.editable ? placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          defaultValue={parseFormattedValue(fi.value)}
          maxLength={fi.dataItem.maxLength}
          autoComplete="off"
          inputMode="decimal"
          onChange={change}
          onKeyDown={keydown}
          onFocus={focus}
          onBlur={blur}
          data-invalid={fi.attrs["data-invalid"]}
        />
        {fi.mountValue &&
          <input
            type="hidden"
            name={fi.name}
            value={empty ? "" : fi.value}
            disabled={fi.disabled}
          />
        }
        {!hideSpinButtons && fi.showButtons &&
          <>
            <div className="ipt-num-spins">
              <div
                className="ipt-btn ipt-num-spin-inc"
                data-disabled={!fi.editable}
                tabIndex={-1}
                onMouseDown={() => mousedown("up")}
              />
              <div
                className="ipt-btn ipt-num-spin-dec"
                data-disabled={!fi.editable}
                tabIndex={-1}
                onMouseDown={() => mousedown("down")}
              />
            </div>
          </>
        }
        {fi.clearButton(empty ? undefined : clear)}
      </div>
      {fi.messageComponent}
    </>
  );
};
