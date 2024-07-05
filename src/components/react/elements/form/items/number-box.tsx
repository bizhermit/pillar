import { $numParse } from "@/data-items/number/parse";
import { $numValidations } from "@/data-items/number/validation";
import { formatNum, parseNum } from "@/objects/number";
import { ChangeEvent, HTMLAttributes, KeyboardEvent, useRef } from "react";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type NumberBoxOptions<D extends DataItem.$num> = FormItemOptions<D> & {
  min?: number;
  max?: number;
  maxLength?: number;
  float?: number;
  requiredIsNotZero?: boolean;
  preventThousandSeparate?: boolean;
  step?: number;
  hideSpinButtons?: boolean;
};

type NumberBoxProps<D extends DataItem.$num> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, NumberBoxOptions<D>>;

export const NumberBox = <D extends DataItem.$num>({
  min,
  max,
  maxLength,
  float,
  requiredIsNotZero,
  preventThousandSeparate,
  step,
  hideSpinButtons,
  ...props
}: NumberBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);

  const fi = useFormItemCore<DataItem.$num, D>(props, {
    dataItemDeps: [],
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
    parse: (p) => $numParse(p),
    effect: ({ edit, value }) => {
      if (!edit && iref.current) iref.current.value = parseFormattedValue(value);
    },
    validations: ({ dataItem }) => $numValidations(dataItem),
    focus: () => iref.current?.focus(),
  });

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
    fi.set({
      value: v,
      edit: false,
    });
  };

  const decrement = () => {
    const v = (() => {
      if (fi.valueRef.current == null) return fi.dataItem.min ?? 0;
      return minmax(fi.valueRef.current - (step || 1));
    })();
    fi.set({
      value: v,
      edit: false,
    });
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
    fi.clear();
    setTimeout(() => iref.current?.focus(), 0);
  };

  const empty = fi.value == null || Number.isNaN(fi.value);

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        className={joinClassNames("ipt-field", props.className)}
      >
        <input
          ref={iref}
          className="ipt-num"
          type="text"
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          tabIndex={fi.tabIndex}
          defaultValue={parseFormattedValue(fi.value)}
          maxLength={fi.dataItem.maxLength}
          autoComplete="off"
          inputMode="decimal"
          onChange={change}
          onKeyDown={keydown}
          onFocus={focus}
          onBlur={blur}
        />
        {!empty &&
          <input
            type="hidden"
            name={fi.name}
            value={fi.value}
          />
        }
        {!hideSpinButtons && fi.editable &&
          <>
            <div className="ipt-num-spins">
              <button
                className="ipt-btn ipt-num-spin-inc"
                type="button"
                tabIndex={-1}
                disabled={fi.form.pending}
                onMouseDown={() => mousedown("up")}
              />
              <button
                className="ipt-btn ipt-num-spin-dec"
                type="button"
                tabIndex={-1}
                disabled={fi.form.pending}
                onMouseDown={() => mousedown("down")}
              />
            </div>
          </>
        }
        {!fi.hideClearButton && fi.editable &&
          <button
            className="ipt-btn"
            type="button"
            tabIndex={-1}
            disabled={fi.form.pending || empty}
            onClick={clear}
          >
            ×
          </button>
        }
      </div>
      {fi.messageComponent}
    </>
  );
};
