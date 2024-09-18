import { type ChangeEvent, type FocusEvent, type HTMLAttributes, type KeyboardEvent, ReactElement, useMemo, useReducer, useRef } from "react";
import { $timeParse } from "../../../../data-items/time/parse";
import { $timeValidations } from "../../../../data-items/time/validation";
import { equals } from "../../../../objects";
import { isEmpty } from "../../../../objects/string";
import { set } from "../../../../objects/struct";
import { getTimeUnit, parseTimeAsUnit, Time, TimeRadix } from "../../../../objects/time";
import { Dialog, useDialog } from "../../dialog";
import { CrossIcon, DownFillIcon } from "../../icon";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type TimeValue = { time: Time | null | undefined; unitValue: number | null | undefined; };

type TimeBoxOptions<D extends DataItem.$time | undefined> =
  FormItemOptions<D, D extends DataItem.$time ? DataItem.ValueType<D> : number, TimeValue> &
  {
    mode?: DataItem.$time["mode"];
    min?: number;
    max?: number;
    pair?: DataItem.$time["pair"];
    initFocusTime?: number;
  };

type TimeBoxProps<D extends DataItem.$time | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TimeBoxOptions<D>>;

const isNumericOrEmpty = (value?: string): value is `${number}` => {
  if (isEmpty(value)) return true;
  return /^[0-9]+$/.test(value);
};

export const TimeBox = <D extends DataItem.$time | undefined>({
  mode,
  min,
  max,
  pair,
  initFocusTime,
  ...props
}: TimeBoxProps<D>) => {
  const href = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const sref = useRef<HTMLInputElement>(null!);
  const cache = useRef<{ h: number | undefined; m: number | undefined; s: number | undefined; }>({ h: undefined, m: undefined, s: undefined });
  const dialog = useDialog(true);

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

  const fi = useFormItemCore<DataItem.$time, D, number, TimeValue>(props, {
    dataItemDeps: [mode, min, max, pair?.name, pair?.position, pair?.same],
    getDataItem: ({ dataItem, refs }) => {
      const $pair = pair ?? dataItem?.pair;
      return {
        type: "time",
        mode: mode ?? dataItem?.mode ?? "hm",
        min: min ?? dataItem?.min,
        max: dataItem?.max,
        pair: $pair,
        refs: $pair ? [$pair.name, ...(refs ?? [])] : refs,
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
    validation: ({ dataItem, iterator }) => {
      const funcs = $timeValidations(dataItem);
      return (v, p) => iterator(funcs, { ...p, value: v?.unitValue });
    },
    setBind: ({ data, name, value }) => {
      if (name) set(data, name, value?.unitValue);
    },
    focus: focusInput,
  });

  const unit = getTimeUnit(fi.dataItem.mode!);
  const includeHours = fi.dataItem.mode === "ms";

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
    return new Time(Math.max(fi.dataItem.min ?? 0, 0), unit);
  }, [fi.dataItem.min]);

  const maxTime = useMemo(() => {
    if (fi.dataItem.max == null) return new Time(24 * TimeRadix.H - TimeRadix.S);
    return new Time(Math.max(fi.dataItem.max ?? 0, 0), unit);
  }, [fi.dataItem.max]);

  const $initFocusTime = useMemo(() => {
    return new Time(Math.max(initFocusTime ?? 0), unit);
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
        if (opts?.focusTarget) {
          focusInput(opts.focusTarget);
        }
      },
    });
  };

  const closeDialog = (focus?: boolean) => {
    if (focus) focusInput();
    dialog.close();
  };

  const click = (target?: "h" | "m" | "s") => {
    showDialog({ focusTarget: target });
  };

  const focus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const blur = (e: FocusEvent<HTMLDivElement>) => {
    let elem = e.relatedTarget;
    while (elem) {
      if (elem === e.currentTarget) {
        props.onBlur?.(e);
        return;
      }
      elem = elem.parentElement;
    }
    closeDialog();
    renderInputs(fi.valueRef.current);
    props.onBlur?.(e);
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
        renderInputs(fi.value);
        closeDialog();
        break;
      case "ArrowUp":
        updown(1, 0, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        updown(-1, 0, 0);
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
        renderInputs(fi.value);
        closeDialog();
        break;
      case "Backspace":
        if (e.currentTarget.value.length === 0) href.current?.focus();
        break;
      case "ArrowUp":
        updown(0, 1, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        updown(0, -1, 0);
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
        renderInputs(fi.value);
        closeDialog();
        break;
      case "Backspace":
        if (e.currentTarget.value.length === 0) mref.current?.focus();
        break;
      case "ArrowUp":
        updown(0, 0, 1);
        e.preventDefault();
        break;
      case "ArrowDown":
        updown(0, 0, -1);
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
        {...fi.attrs}
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
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
              data-invalid={fi.attrs["data-invalid"]}
              defaultValue={fi.value?.time?.getHours()}
              onClick={() => click("h")}
              onChange={changeH}
              onKeyDown={keydownH}
              onFocus={focus}
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
          data-invalid={fi.attrs["data-invalid"]}
          defaultValue={(() => {
            const m = fi.value?.time?.getMinutes(includeHours);
            return m == null ? undefined : includeHours ? m : `00${m}`.slice(-2);
          })()}
          onClick={() => click("m")}
          onChange={changeM}
          onKeyDown={keydownM}
          onFocus={focus}
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
              data-invalid={fi.attrs["data-invalid"]}
              defaultValue={(() => {
                const s = fi.value?.time?.getSeconds();
                return s == null ? undefined : `00${s}`.slice(-2);
              })()}
              onClick={() => click("s")}
              onChange={changeS}
              onKeyDown={keydownS}
              onFocus={focus}
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
          <div
            className="ipt-btn"
            data-disabled={!fi.editable || dialog.showed}
            onClick={clickPull}
            tabIndex={-1}
            data-showed={dialog.showed}
          >
            <DownFillIcon />
          </div>
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
};

export const TimePicker = (props: TimePickerProps) => {
  const mode = props.mode || "hm";
  const includeHours = mode === "ms";
  const value = props.value ?? props.initValue;
  const hourStep = Math.max(1, props.hourStep ?? 1);
  const minuteStep = Math.max(1, props.minuteStep ?? 5);
  const secondStep = Math.max(1, props.secondStep ?? 10);
  const minTime = props.minTime ?? new Time();
  const maxTime = props.maxTime ?? new Time(24 * TimeRadix.H - TimeRadix.S);

  const [dispTime, setDispTime] = useReducer((state: Time, { h, m, s, act }: { h?: number; m?: number; s?: number; act?: "select" | "effect"; }) => {
    const newTime = new Time(state);
    if (h != null) newTime.setHours(h);
    if (m != null) newTime.setMinutes(m);
    if (s != null) newTime.setSeconds(s);
    return newTime;
  }, value ?? minTime ?? new Time());
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
        <div
          {...attrs}
          key={hour}
          className="ipt-tp-cell"
          data-selected={hour === hNum}
          data-current={hour === curH}
          data-disabled={!selectable}
          onClick={() => {
            setDispTime({ h: hour });
          }}
        >
          {hour}
        </div>
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
        <div
          {...attrs}
          key={minute}
          className="ipt-tp-cell"
          data-selected={minute === mNum}
          data-current={minute === curM}
          data-disabled={!selectable}
          onClick={() => {
            setDispTime({ m: minute });
          }}
        >
          {`00${minute}`.slice(-2)}
        </div>
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
        <div
          {...attrs}
          key={second}
          className="ipt-tp-cell"
          data-selected={second === sNum}
          data-current={second === curS}
          data-disabled={!selectable}
          onClick={() => {
            setDispTime({ s: second });
          }}
        >
          {`00${second}`.slice(-2)}
        </div>
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

  return (
    <div
      className="ipt-tp"
      data-dialog={props.dialog}
    >
      <div
        className="ipt-tp-main"
      >
        {mode !== "ms" &&
          <>
            <div
              className="ipt-tp-times"
            >
              {hourCells}
            </div>
            <span className="ipt-sep">:</span>
          </>
        }
        <div
          className="ipt-tp-times"
        >
          {minuteCells}
        </div>
        {mode !== "hm" &&
          <>
            <span className="ipt-sep">:</span>
            <div
              className="ipt-tp-times"
            >
              {secondCells}
            </div>
          </>
        }
      </div>
      <div className="ipt-tp-btns">
        {props.onCancel &&
          <div
            className="ipt-btn"
            title="キャンセル"
            onClick={() => {
              props.onCancel!();
            }}
          >
            <CrossIcon />
          </div>
        }
        {props.onSelect &&
          <div
            className="ipt-btn"
            onClick={() => {
              props.onSelect!({
                time: dispTime.getTime(),
              });
            }}
          >
            OK
          </div>
        }
      </div>
    </div>
  );
};
