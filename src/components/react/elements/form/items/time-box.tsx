import { type ChangeEvent, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactElement, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { $timeParse } from "../../../../data-items/time/parse";
import { $timeValidations } from "../../../../data-items/time/validation";
import { equals } from "../../../../objects";
import { DateTime } from "../../../../objects/datetime";
import { isEmpty } from "../../../../objects/string";
import { set } from "../../../../objects/struct";
import { getTimeUnit, parseTimeAsUnit, roundTime, Time, TimeRadix } from "../../../../objects/time";
import { Dialog, useDialog } from "../../dialog";
import { ClockIcon, CrossIcon } from "../../icon";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type TimeValue = { time: Time | null | undefined; unitValue: number | null | undefined; };

type TimeBoxOptions<D extends DataItem.$time | undefined> =
  FormItemOptions<D, D extends DataItem.$time ? DataItem.ValueType<D> : number, TimeValue, number | string | Date | DateTime> &
  {
    mode?: DataItem.$time["mode"];
    min?: DataItem.$time["min"];
    max?: DataItem.$time["max"];
    pair?: DataItem.$time["pair"];
    hourStep?: DataItem.$time["hourStep"];
    minuteStep?: DataItem.$time["minuteStep"];
    secondStep?: DataItem.$time["secondStep"];
    hourTimePickerStep?: number;
    minuteTimePickerStep?: number;
    secondTimePickerStep?: number;
    initFocusTime?: number | Date | string | DateTime;
  };

type TimeBoxProps<D extends DataItem.$time | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TimeBoxOptions<D>>;

const isNumericOrEmpty = (value?: string): value is `${number}` => {
  if (isEmpty(value)) return true;
  return /^[0-9]+$/.test(value);
};

const defaultMinTime = new Time();
const defaultMaxTime = new Time(24 * TimeRadix.H - TimeRadix.S);

export const TimeBox = <D extends DataItem.$time | undefined>({
  mode,
  min,
  max,
  pair,
  initFocusTime,
  hourStep,
  minuteStep,
  secondStep,
  hourTimePickerStep,
  minuteTimePickerStep,
  secondTimePickerStep,
  ...props
}: TimeBoxProps<D>) => {
  const href = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const sref = useRef<HTMLInputElement>(null!);
  const cache = useRef<{ h: number | undefined; m: number | undefined; s: number | undefined; }>({ h: undefined, m: undefined, s: undefined });
  const dialog = useDialog(true);
  const [showed, setShowed] = useState(false);

  const focusInput = (target?: "h" | "m" | "s") => {
    switch (target) {
      case "h":
        href.current?.focus();
        break;
      case "m":
        mref.current?.focus();
        break;
      case "s":
        sref.current?.focus();
        break;
      default:
        (href.current ?? mref.current ?? sref.current)?.focus();
        break;
    }
  };

  const fi = useFormItemCore<DataItem.$time, D, number, TimeValue, number | string | Date | DateTime>(props, {
    dataItemDeps: [mode, min, max, pair?.name, pair?.position, pair?.same, hourStep, minuteStep, secondStep],
    getDataItem: ({ dataItem, refs }) => {
      const $pair = pair ?? dataItem?.pair;
      return {
        type: "time",
        mode: mode ?? dataItem?.mode ?? "hm",
        min: min ?? dataItem?.min,
        max: dataItem?.max,
        pair: $pair,
        refs: $pair ? [$pair.name, ...(refs ?? [])] : refs,
        hourStep: hourStep ?? dataItem?.hourStep,
        minuteStep: minuteStep ?? dataItem?.minuteStep,
        secondStep: secondStep ?? dataItem?.secondStep,
      };
    },
    parse: () => {
      return (p) => {
        const [t, r] = $timeParse(p);
        if (t == null) return [{ time: undefined, unitValue: undefined }, r];
        return [{ time: new Time(t, getTimeUnit(p.dataItem.mode!)), unitValue: t }, r];
      };
    },
    revert: (v) => v?.unitValue,
    effect: ({ edit, value, effect }) => {
      if (!edit || effect) renderInputs(value);
    },
    equals: (v1, v2) => equals(v1?.unitValue, v2?.unitValue),
    validation: ({ dataItem, env, iterator }) => {
      const funcs = $timeValidations({ dataItem, env });
      return (v, p) => iterator(funcs, { ...p, value: v?.unitValue });
    },
    setBind: ({ data, name, value }) => {
      if (name) set(data, name, value?.unitValue);
    },
    focus: focusInput,
  });

  const unit = getTimeUnit(fi.dataItem.mode!);
  const includeHours = fi.dataItem.mode === "ms";
  const hStep = fi.dataItem.hourStep ?? 1;
  const mStep = fi.dataItem.minuteStep ?? 1;
  const sStep = fi.dataItem.secondStep ?? 1;

  const renderInputs = (v: TimeValue | null | undefined) => {
    if (v?.time == null) {
      if (href.current) href.current.value = "";
      if (mref.current) mref.current.value = "";
      if (sref.current) sref.current.value = "";
      cache.current.h = cache.current.m = cache.current.s = undefined;
      return;
    }
    cache.current.h = cache.current.m = cache.current.s = 0;
    if (href.current) href.current.value = String(cache.current.h = v.time.getHours());
    if (mref.current) {
      cache.current.m = v.time.getMinutes(includeHours);
      mref.current.value = includeHours ? String(cache.current.m) : `00${cache.current.m}`.slice(-2);
    }
    if (sref.current) sref.current.value = `00${cache.current.s = v.time.getSeconds()}`.slice(-2);
  };

  const minTime = useMemo(() => {
    return new Time(fi.dataItem.min ?? defaultMinTime, unit);
  }, [fi.dataItem.min]);

  const maxTime = useMemo(() => {
    return new Time(fi.dataItem.max ?? defaultMaxTime, unit);
  }, [fi.dataItem.max]);

  const $initFocusTime = useMemo(() => {
    return new Time(initFocusTime, unit);
  }, [initFocusTime]);

  const empty = fi.value?.unitValue == null;

  const showDialog = (opts?: {
    focusTarget?: "h" | "m" | "s";
  }) => {
    if (!fi.editable || dialog.showed) return;
    const anchorElem = (href.current ?? mref.current ?? sref.current)?.parentElement;
    if (!anchorElem) return;
    if (opts?.focusTarget) {
      focusInput(opts.focusTarget);
    }
    dialog.open({
      anchor: {
        element: anchorElem,
        x: "inner",
        y: "outer",
      },
      callbackBeforeAnimation: () => {
        setShowed(true);
        if (opts?.focusTarget) {
          focusInput(opts.focusTarget);
        }
      },
    });
  };

  const closeDialog = (focus?: boolean) => {
    if (focus) focusInput();
    dialog.close();
    setShowed(false);
  };

  const click = (target?: "h" | "m" | "s") => {
    showDialog({ focusTarget: target });
  };

  const focus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const blur = (e?: FocusEvent<HTMLDivElement>) => {
    let elem = e?.relatedTarget;
    while (elem) {
      if (elem === e!.currentTarget) {
        props.onBlur?.(e!);
        return;
      }
      elem = elem.parentElement;
    }
    closeDialog();
    const time = fi.valueRef.current?.time;
    if (time) {
      const t = new Time();
      t.setHours(roundTime(time.getHours(), hStep));
      t.setMinutes(roundTime(time.getMinutes(), mStep));
      t.setSeconds(roundTime(time.getSeconds(), sStep));
      if (t.getTime() !== time.getTime()) {
        fi.set({
          value: { time: t, unitValue: parseTimeAsUnit(t.getTime(), unit) },
          effect: true,
        });
      }
    }
    renderInputs(fi.valueRef.current);
    if (e) props.onBlur?.(e);
  };

  const commitChange = () => {
    switch (fi.dataItem.mode) {
      case "hms":
        if (cache.current.h == null || cache.current.m == null || cache.current.s == null) {
          fi.set({ value: undefined, edit: true, effect: false });
          return;
        }
        break;
      case "ms":
        if (cache.current.m == null || cache.current.s == null) {
          fi.set({ value: undefined, edit: true, effect: false });
          return;
        }
        break;
      default:
        if (cache.current.h == null || cache.current.m == null) {
          fi.set({ value: undefined, edit: true, effect: false });
          return;
        }
        break;
    }

    const time = new Time(
      (cache.current.h ?? 0) * TimeRadix.H +
      (cache.current.m ?? 0) * TimeRadix.M +
      (cache.current.s ?? 0) * TimeRadix.S
    );
    fi.set({ value: { time, unitValue: parseTimeAsUnit(time.getTime(), unit) }, edit: true, effect: false });
  };

  const changeH = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    const v = e.currentTarget.value;
    if (!isNumericOrEmpty(v)) {
      e.currentTarget.value = String(cache.current.h || "");
      return;
    }
    cache.current.h = isEmpty(v) ? undefined : Number(v);
    if (v.length === 2) mref.current?.focus();
    commitChange();
  };

  const changeM = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    const v = e.currentTarget.value;
    if (!isNumericOrEmpty(v)) {
      e.currentTarget.value = String(cache.current.m || "");
      return;
    }
    if (isEmpty(v)) {
      cache.current.m = undefined;
    } else {
      cache.current.m = Number(v);
      if (v.length === 2 || (includeHours && cache.current.m > 59)) sref.current?.focus();
    }
    commitChange();
  };

  const changeS = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    const v = e.currentTarget.value;
    if (!isNumericOrEmpty(v)) {
      e.currentTarget.value = String(cache.current.s || "");
      return;
    }
    cache.current.s = isEmpty(v) ? undefined : Number(v);
    commitChange();
  };

  const updown = (h = 0, m = 0, s = 0) => {
    if (!fi.editable) return;
    let hours = cache.current.h == null ? $initFocusTime.getHours() : cache.current.h + h;
    let minutes = cache.current.m == null ? $initFocusTime.getMinutes(includeHours) : cache.current.m + m;
    let seconds = cache.current.s == null ? $initFocusTime.getSeconds() : cache.current.s + s;
    let time = new Time(hours * TimeRadix.H + minutes * TimeRadix.M + seconds * TimeRadix.S);

    if (minTime) {
      if (minTime.getTime() > time.getTime()) {
        hours = minTime.getHours();
        minutes = minTime.getMinutes(includeHours);
        seconds = minTime.getSeconds();
        time = new Time(minTime);
      }
    }
    if (maxTime) {
      if (maxTime.getTime() < time.getTime()) {
        hours = maxTime.getHours();
        minutes = maxTime.getMinutes(includeHours);
        seconds = maxTime.getSeconds();
        time = new Time(maxTime);
      }
    }
    if (!(cache.current.s !== seconds || cache.current.m !== minutes || cache.current.h !== hours)) return;
    fi.set({ value: { time: time, unitValue: parseTimeAsUnit(time.getTime(), unit) }, edit: true, effect: true });
  };

  const keydownH = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    switch (e.key) {
      case "F2":
        showDialog({ focusTarget: "h" });
        break;
      case "Enter":
        blur();
        break;
      case "ArrowUp":
        updown(hStep, 0, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        updown(-hStep, 0, 0);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const keydownM = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    switch (e.key) {
      case "F2":
        showDialog({ focusTarget: "m" });
        break;
      case "Enter":
        blur();
        break;
      case "Backspace":
        if (e.currentTarget.value.length === 0) href.current?.focus();
        break;
      case "ArrowUp":
        updown(0, mStep, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        updown(0, -mStep, 0);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const keydownS = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    switch (e.key) {
      case "F2":
        showDialog({ focusTarget: "s" });
        break;
      case "Enter":
        blur();
        break;
      case "Backspace":
        if (e.currentTarget.value.length === 0) mref.current?.focus();
        break;
      case "ArrowUp":
        updown(0, 0, sStep);
        e.preventDefault();
        break;
      case "ArrowDown":
        updown(0, 0, -sStep);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const clickPull = () => {
    showDialog();
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
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
        data-disabled={fi.disabled}
        data-invalid={fi.iptAria["aria-invalid"]}
      >
        {fi.dataItem.mode !== "ms" &&
          <>
            <input
              ref={href}
              type="text"
              className="ipt-txt ipt-time-h"
              disabled={fi.disabled}
              readOnly={fi.readOnly}
              tabIndex={fi.tabIndex}
              autoFocus={fi.autoFocus}
              maxLength={2}
              autoComplete="off"
              inputMode="numeric"
              defaultValue={fi.value?.time?.getHours()}
              onClick={() => click("h")}
              onChange={changeH}
              onKeyDown={keydownH}
              onFocus={focus}
              aria-haspopup="dialog"
              {...fi.iptAria}
            />
            <span
              className="ipt-sep"
              onClick={() => click("m")}
            >
              :
            </span>
          </>
        }
        <input
          ref={mref}
          type="text"
          className="ipt-txt ipt-time-m"
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          autoFocus={fi.dataItem.mode === "ms" && fi.autoFocus}
          maxLength={2}
          autoComplete="off"
          inputMode="numeric"
          defaultValue={(() => {
            const m = fi.value?.time?.getMinutes(includeHours);
            return m == null ? undefined : includeHours ? m : `00${m}`.slice(-2);
          })()}
          onClick={() => click("m")}
          onChange={changeM}
          onKeyDown={keydownM}
          onFocus={focus}
          data-last={fi.dataItem.mode === "hm" ? "" : undefined}
          aria-haspopup="dialog"
          {...fi.iptAria}
        />
        {fi.dataItem.mode !== "hm" &&
          <>
            <span
              className="ipt-sep"
              onClick={() => click("s")}
            >
              :
            </span>
            <input
              ref={sref}
              type="text"
              className="ipt-txt ipt-time-s"
              disabled={fi.disabled}
              readOnly={fi.readOnly}
              tabIndex={fi.tabIndex}
              maxLength={2}
              autoComplete="off"
              inputMode="numeric"
              defaultValue={(() => {
                const s = fi.value?.time?.getSeconds();
                return s == null ? undefined : `00${s}`.slice(-2);
              })()}
              onClick={() => click("s")}
              onChange={changeS}
              onKeyDown={keydownS}
              onFocus={focus}
              data-last=""
              aria-haspopup="dialog"
              {...fi.iptAria}
            />
          </>
        }
        {fi.mountValue &&
          <input
            type="hidden"
            name={fi.name}
            value={empty ? "" : fi.value.unitValue!}
            disabled={fi.disabled}
          />
        }
        {fi.showButtons &&
          <button
            className="ipt-btn"
            type="button"
            disabled={!fi.editable || dialog.showed}
            onClick={clickPull}
            tabIndex={-1}
            aria-haspopup="dialog"
            aria-expanded={dialog.showed}
          >
            <ClockIcon />
          </button>
        }
        {fi.clearButton(empty ? undefined : clear)}
        <Dialog
          modeless
          hook={dialog.hook}
          mobile
          className="ipt-dialog"
        >
          <TimePicker
            mode={fi.dataItem.mode}
            initValue={$initFocusTime}
            minTime={minTime}
            maxTime={maxTime}
            dialog
            preventSelectedRender
            showed={showed}
            hourStep={hourTimePickerStep ?? hStep}
            minuteStep={minuteTimePickerStep ?? mStep}
            secondStep={secondTimePickerStep ?? sStep}
            value={fi.value?.time}
            onSelect={({ time }) => {
              if (time == null) {
                fi.clear(true);
              } else {
                fi.set({ value: { time: new Time(time), unitValue: parseTimeAsUnit(time, unit) }, edit: true, effect: true });
              }
              closeDialog(true);
            }}
            onCancel={() => {
              closeDialog(true);
            }}
          />
        </Dialog>
      </div>
      {fi.messageComponent}
    </>
  );
};

type TimePickerProps = {
  mode?: DataItem.$time["mode"];
  value?: Time | null | undefined;
  initValue?: Time | null | undefined;
  minTime?: Time | null | undefined;
  maxTime?: Time | null | undefined;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  dialog?: boolean;
  preventSelectedRender?: boolean;
  onSelect?: (params: { time: number; action?: "clear"; }) => void;
  onCancel?: () => void;
  showed?: boolean;
};

type DispTimeDispatchParams = {
  h?: number;
  m?: number;
  s?: number;
  act?: "select" | "effect";
};

const pickerListClassName = "ipt-tp-times";
const pickerCellClassName = "ipt-tp-cell";

export const TimePicker = (props: TimePickerProps) => {
  const wref = useRef<HTMLDivElement>(null!);

  const mode = props.mode || "hm";
  const includeHours = mode === "ms";
  const value = props.value ?? props.initValue;
  const hourStep = Math.max(1, props.hourStep ?? 1);
  const minuteStep = Math.max(1, props.minuteStep ?? 5);
  const secondStep = Math.max(1, props.secondStep ?? 10);
  const minTime = props.minTime ?? defaultMinTime;
  const maxTime = props.maxTime ?? defaultMaxTime;

  const [{ dispTime, effectRev }, setDispTime] = useReducer((state: { dispTime: Time; effectRev: number; }, { h, m, s, act }: DispTimeDispatchParams) => {
    const newTime = new Time(state.dispTime);
    if (h != null) newTime.setHours(h);
    if (m != null) newTime.setMinutes(m);
    if (s != null) newTime.setSeconds(s);
    if (state.dispTime.getTime() === newTime.getTime()) {
      if (act === "effect") return { dispTime: state.dispTime, effectRev: state.effectRev + 1 };
      return state;
    }
    return { dispTime: newTime, effectRev: state.effectRev + (act === "effect" ? 1 : 0) };
  }, { dispTime: value ?? minTime ?? new Time(), effectRev: 0 });

  const hNum = mode === "ms" ? 0 : dispTime.getHours();
  const mNum = dispTime.getMinutes(includeHours);
  const sNum = mode === "hm" ? 0 : dispTime.getSeconds();

  const hourCells = useMemo(() => {
    const cells: Array<ReactElement> = [];
    if (mode === "ms") return cells;

    const curH = new Date().getHours();
    const minHour = minTime.getHours();
    const maxHour = maxTime.getHours();
    let hasOverMinTime = false;
    const overMaxTime = (h: number) => hasOverMinTime || (hasOverMinTime = minHour <= h);
    let hasReachedMaxTime = false;
    const reachedMaxTime = (h: number) => hasReachedMaxTime || (hasReachedMaxTime = maxHour < h);

    const getCellComponent = ({ hour, attrs }: { hour: number; attrs?: { [v: string]: string | undefined } }) => {
      const selectable = overMaxTime(hour) && !reachedMaxTime(hour);

      return (
        <button
          {...attrs}
          key={hour}
          className={pickerCellClassName}
          role="listitem"
          type="button"
          aria-current={hour === hNum}
          data-target={hour === curH}
          disabled={!selectable}
          onClick={() => {
            setDispTime({ h: hour });
          }}
        >
          {hour}
        </button>
      );
    };

    for (let i = 0; i < 24; i += hourStep) {
      cells.push(getCellComponent({ hour: i }));
    }
    return cells;
  }, [
    hNum,
    mode,
    minTime,
    maxTime,
  ]);

  const minuteCells = useMemo(() => {
    const cells: Array<ReactElement> = [];

    const today = new Date();
    const curM = today.getMinutes() + (mode === "ms" ? today.getHours() * 60 : 0);

    const hMinutes = hNum * 60;
    const minMinute = minTime.getMinutes(true);
    const maxMinute = maxTime.getMinutes(true);
    let hasOverMinTime = false;
    const overMinTime = (m: number) => hasOverMinTime || (hasOverMinTime = minMinute <= (m + hMinutes));
    let hasReachedMaxTime = false;
    const reachedMaxTime = (m: number) => hasReachedMaxTime || (hasReachedMaxTime = maxMinute < (m + hMinutes));

    const getCellComponent = ({ minute, attrs }: { minute: number; attrs?: { [v: string]: string | undefined } }) => {
      const selectable = overMinTime(minute) && !reachedMaxTime(minute);

      return (
        <button
          {...attrs}
          key={minute}
          className={pickerCellClassName}
          role="listitem"
          type="button"
          aria-current={minute === mNum}
          data-target={minute === curM}
          disabled={!selectable}
          onClick={() => {
            setDispTime({ m: minute });
          }}
        >
          {`00${minute}`.slice(-2)}
        </button>
      );
    };

    for (let i = 0, il = Math.max(60, maxTime.getMinutes(includeHours)); i < il; i += minuteStep) {
      cells.push(getCellComponent({ minute: i }));
    }
    return cells;
  }, [
    hNum,
    mNum,
    minTime,
    maxTime,
  ]);

  const secondCells = useMemo(() => {
    const cells: Array<ReactElement> = [];
    if (mode === "hm") return cells;

    const curS = new Date().getSeconds();
    const hmSeconds = (hNum * 60 + mNum) * 60;
    const minSecond = minTime.getSeconds(true);
    const maxSecond = maxTime.getSeconds(true);
    let hasOverMinTime = false;
    const overMinTime = (s: number) => hasOverMinTime || (hasOverMinTime = minSecond <= (s + hmSeconds));
    let hasReachedMaxTime = false;
    const reachedMaxTime = (s: number) => hasReachedMaxTime || (hasReachedMaxTime = maxSecond < (s + hmSeconds));

    const getCellComponent = ({ second, attrs }: { second: number; attrs?: { [v: string]: string | undefined } }) => {
      const selectable = overMinTime(second) && !reachedMaxTime(second);

      return (
        <button
          {...attrs}
          key={second}
          className={pickerCellClassName}
          role="listitem"
          type="button"
          aria-current={second === sNum}
          data-target={second === curS}
          disabled={!selectable}
          onClick={() => {
            setDispTime({ s: second });
          }}
        >
          {`00${second}`.slice(-2)}
        </button>
      );
    };

    for (let i = 0; i < 60; i += secondStep) {
      cells.push(getCellComponent({ second: i }));
    }
    return cells;
  }, [
    hNum,
    mNum,
    sNum,
    mode,
    minTime,
    maxTime,
  ]);

  useEffect(() => {
    const v = value ?? minTime ?? new Time();
    setDispTime({
      h: includeHours ? 0 : v.getHours(),
      m: v.getMinutes(includeHours),
      s: mode === "hm" ? 0 : v.getSeconds(),
      act: "effect",
    });
  }, [props.value]);

  useEffect(() => {
    if (props.showed === false) return;
    wref.current.querySelectorAll(`.${pickerListClassName}`).forEach(list => {
      const elem = list.querySelector(`.${pickerCellClassName}[aria-current="true"]`);
      if (elem == null) return;
      elem.scrollIntoView({ block: "center" });
    });
  }, [effectRev, props.showed]);

  const inRange = minTime.getTime() <= dispTime.getTime() && dispTime.getTime() <= maxTime.getTime();

  return (
    <div
      className="ipt-tp"
      data-dialog={props.dialog}
      ref={wref}
    >
      <div className="ipt-tp-main">
        {mode !== "ms" &&
          <>
            <div
              className={pickerListClassName}
              role="listbox"
            >
              {hourCells}
            </div>
            <span className="ipt-sep">:</span>
          </>
        }
        <div
          className={pickerListClassName}
          role="listbox"
        >
          {minuteCells}
        </div>
        {mode !== "hm" &&
          <>
            <span className="ipt-sep">:</span>
            <div
              className={pickerListClassName}
              role="listbox"
            >
              {secondCells}
            </div>
          </>
        }
      </div>
      <div className="ipt-tp-btns">
        {props.onCancel &&
          <button
            className="ipt-btn"
            type="button"
            title="キャンセル"
            onClick={() => {
              props.onCancel!();
            }}
          >
            <CrossIcon />
          </button>
        }
        {props.onSelect &&
          <button
            className="ipt-btn"
            type="button"
            data-disabled={!inRange}
            onClick={() => {
              if (!inRange) return;
              props.onSelect!({
                time: dispTime.getTime(),
              });
            }}
          >
            OK
          </button>
        }
      </div>
    </div>
  );
};
