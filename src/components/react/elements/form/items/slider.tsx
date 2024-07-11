"use client";

import { type HTMLAttributes, type KeyboardEvent, useRef } from "react";
import { $numParse } from "../../../../data-items/number/parse";
import { $numValidations } from "../../../../data-items/number/validation";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type SliderOptions<D extends DataItem.$num | undefined> = Omit<FormItemOptions<D, D extends DataItem.$num ? DataItem.ValueType<D> : number>, "hideClearButton"> & {
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
  const clickThumbRef = useRef(false);
  const bref = useRef<HTMLDivElement>(null!);

  const fi = useFormItemCore<DataItem.$num, D, number, number>(props, {
    dataItemDeps: [min, max, requiredIsNotZero],
    getDataItem: ({ dataItem }) => {
      return {
        type: "num",
        min: min ?? dataItem?.min ?? 0,
        max: max ?? dataItem?.max ?? 100,
        requiredIsNotZero: requiredIsNotZero ?? dataItem?.requiredIsNotZero,
      };
    },
    parse: () => $numParse,
    effect: () => { },
    validation: ({ dataItem, iterator }) => {
      const funcs = $numValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: () => bref.current?.parentElement?.focus(),
  });

  const changeStart = (thumbElem: HTMLDivElement, clientX: number, isTouch?: boolean) => {
    if (!fi.editable || fi.form.pending) return;
    clickThumbRef.current = true;
    const width = thumbElem.parentElement!.clientWidth;
    const cVal = fi.value ?? fi.dataItem.min!;
    const range = fi.dataItem.max! - fi.dataItem.min!;

    const moveImpl = (cx: number) => {
      fi.set({ value: Math.min(fi.dataItem.max!, Math.max(fi.dataItem.min!, cVal + Math.round(range * (cx - clientX) / width))), edit: true });
    };
    if (isTouch) {
      const move = (e: TouchEvent) => moveImpl(e.touches[0].clientX);
      const end = () => {
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);
        setTimeout(() => {
          clickThumbRef.current = false;
        }, 0);
      };
      window.addEventListener("touchend", end);
      window.addEventListener("touchmove", move);
    } else {
      const move = (e: MouseEvent) => moveImpl(e.clientX);
      const end = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", end);
        setTimeout(() => {
          clickThumbRef.current = false;
        }, 0);
      };
      window.addEventListener("mouseup", end);
      window.addEventListener("mousemove", move);
    }
  };

  const click = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fi.editable || fi.form.pending || clickThumbRef.current || !bref.current) {
      props.onClick?.(e);
      return;
    }
    const x = e.nativeEvent.offsetX;
    const barW = bref.current.offsetWidth;
    const margin = e.currentTarget.clientWidth - barW;
    const marginSide = margin / 2;
    if (marginSide <= x && x <= marginSide + barW) {
      fi.set({
        value: Math.min(fi.dataItem.max!, Math.max(fi.dataItem.min!, Math.round((fi.dataItem.max! - fi.dataItem.min!) * (x - marginSide) / (barW - margin)))),
        edit: true,
      });
    }
    props.onClick?.(e);
  };

  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!fi.editable || fi.form.pending) return;
    switch (e.key) {
      case "ArrowLeft":
        if (e.ctrlKey) fi.set({ value: fi.dataItem.min, edit: true });
        else fi.set({ value: Math.max(fi.dataItem.min!, (fi.value ?? fi.dataItem.min!) - (step ?? 1)), edit: true });
        e.preventDefault();
        break;
      case "ArrowRight":
        if (e.ctrlKey) fi.set({ value: fi.dataItem.max, edit: true });
        else fi.set({ value: Math.min(fi.dataItem.max!, (fi.value ?? fi.dataItem.min!) + (step ?? 1)), edit: true });
        e.preventDefault();
        break;
      default:
        break;
    }
    props.onKeyDown?.(e);
  };

  const empty = fi.value == null || Number.isNaN(fi.value);
  const rate = Math.round(((empty ? fi.dataItem.min! : fi.value) - fi.dataItem.min!) * 100 / (fi.dataItem.max! - fi.dataItem.min!)) + "%";

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        className={joinClassNames("ipt-slider")}
        tabIndex={fi.disabled ? undefined : (fi.tabIndex ?? 0)}
        onKeyDown={keydown}
        onClick={click}
      >
        <div
          className="ipt-slider-bar"
          ref={bref}
        >
          <div
            className="ipt-slider-rate"
            style={{ width: rate }}
          />
        </div>
        <div className="ipt-slider-rail">
          <div
            className="ipt-slider-thumb"
            style={{ left: rate }}
            onMouseDown={e => changeStart(e.currentTarget, e.clientX)}
            onTouchStart={e => changeStart(e.currentTarget, e.touches[0].clientX, true)}
            data-editable={fi.editable && !fi.form.pending}
            data-value={fi.value == null ? undefined : String(fi.value)}
          />
        </div>
      </div>
      {fi.messageComponent}
    </>
  );
};
