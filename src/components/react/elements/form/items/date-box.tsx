"use client";

import { type ChangeEvent, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactElement, useEffect, useMemo, useReducer, useRef, type WheelEvent } from "react";
import { $dateParse } from "../../../../data-items/date/parse";
import { $dateValidations } from "../../../../data-items/date/validation";
import { blurToOuter } from "../../../../dom/outer-event";
import { useLang } from "../../../../i18n/react-hook";
import { equals } from "../../../../objects";
import { addDay, addMonth, equalDate, formatDate, getFirstDateAtMonth, getLastDateAtMonth, isAfterDate, isBeforeDate, parseDate, withoutTime } from "../../../../objects/date";
import { DateTime, Month, Week } from "../../../../objects/datetime";
import { isEmpty } from "../../../../objects/string";
import { set } from "../../../../objects/struct";
import "../../../../styles/elements/form/item.scss";
import { Dialog, useDialogRef } from "../../dialog";
import { CalendarIcon, CrossIcon, LeftIcon, RightIcon, TodayIcon, UndoIcon } from "../../icon";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../item-core";

type DataValue = { str: string | null | undefined; date: Date | null | undefined; };

type DateBoxOptions<D extends DataItem.$date | DataItem.$month | undefined> =
  FormItemOptions<D, D extends DataItem.$date | DataItem.$month ? DataItem.ValueType<D> : string, DataValue, Date | string | number | DateTime> &
  {
    type?: "date" | "month";
    min?: DataItem.$date["min"];
    max?: DataItem.$date["max"];
    pair?: DataItem.$date["pair"];
    initFocusDate?: Date | string | number | DateTime;
    placeholder?: string | [string, string] | [string, string, string];
  };

type DateBoxProps<D extends DataItem.$date | DataItem.$month | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, DateBoxOptions<D>>;

const isNumericOrEmpty = (value?: string): value is `${number}` => {
  if (isEmpty(value)) return true;
  return /^[0-9]+$/.test(value);
};

export const DateBox = <D extends DataItem.$date | DataItem.$month | undefined>({
  type,
  min,
  max,
  pair,
  initFocusDate,
  placeholder,
  ...props
}: DateBoxProps<D>) => {
  const yref = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement>(null!);
  const cache = useRef<{ y: number | undefined; m: number | undefined; d: number | undefined; }>({ y: undefined, m: undefined, d: undefined });
  const dialog = useDialogRef(true);

  const focusInput = (target?: "y" | "m" | "d") => {
    switch (target) {
      case "y":
        yref.current?.focus();
        break;
      case "m":
        mref.current?.focus();
        break;
      default:
        (dref.current ?? mref.current)?.focus();
        break;
    }
  };

  const renderInputs = (v: DataValue | null | undefined) => {
    const d = v?.date;
    if (d == null) {
      yref.current.value = "";
      mref.current.value = "";
      if (dref.current) dref.current.value = "";
      cache.current.y = cache.current.m = cache.current.d = undefined;
      return;
    }
    yref.current.value = String(cache.current.y = d.getFullYear());
    mref.current.value = String(cache.current.m = d.getMonth() + 1);
    cache.current.d = d.getDate();
    if (dref.current) dref.current.value = String(cache.current.d);
  };

  const fi = useFormItemCore<DataItem.$date | DataItem.$month, D, string, DataValue, Date | string | number | DateTime>(props, {
    dataItemDeps: [type, min, max, pair?.name, pair?.position, pair?.same],
    getDataItem: ({ dataItem, refs }) => {
      const $pair = pair ?? dataItem?.pair;
      return {
        type: type ?? dataItem?.type ?? "date",
        min: min ?? dataItem?.min,
        max: max ?? dataItem?.max,
        pair: $pair,
        refs: $pair ? [$pair.name, ...(refs ?? [])] : refs,
      };
    },
    parse: () => {
      return (p) => {
        const [d, r] = $dateParse(p);
        if (d == null) return [{ str: undefined, date: undefined }, r];
        return [{ str: formatDate(d), date: d }, r];
      };
    },
    revert: (v) => v?.str,
    effect: ({ edit, value, effect }) => {
      if (yref.current && (!edit || effect)) renderInputs(value);
    },
    equals: (v1, v2) => equals(v1?.str, v2?.str),
    validation: ({ dataItem, env, iterator }) => {
      const funcs = $dateValidations({ dataItem, env });
      return (v, p) => iterator(funcs, { ...p, value: v?.date });
    },
    setBind: ({ data, name, value }) => {
      if (name) set(data, name, value?.str);
    },
    focus: focusInput,
  });

  const minDate = useMemo(() => {
    const min = parseDate(typeof fi.dataItem.min === "function" ? fi.dataItem.min() : fi.dataItem.min);
    if (min == null) return null;
    const d = withoutTime(min);
    if (fi.dataItem.type === "month") {
      return getFirstDateAtMonth(d);
    }
    return d;
  }, [fi.dataItem.min]);

  const maxDate = useMemo(() => {
    const max = parseDate(typeof fi.dataItem.max === "function" ? fi.dataItem.max() : fi.dataItem.max);
    if (max == null) return null;
    const d = withoutTime(max);
    if (fi.dataItem.type === "month") {
      return getLastDateAtMonth(d);
    }
    return d;
  }, [fi.dataItem.max]);

  const $initFocusDate = useMemo(() => {
    return withoutTime(parseDate(initFocusDate) ?? (() => {
      const d = withoutTime(new Date());
      if (fi.dataItem.type === "month") d.setDate(1);
      return d;
    })());
  }, [initFocusDate]);

  const empty = isEmpty(fi.value?.str);

  const showDialog = (opts?: {
    focusTarget?: "y" | "m" | "d";
  }) => {
    if (!fi.editable || dialog.showed) return;
    const anchorElem = yref.current?.parentElement;
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

  const click = (target?: "y" | "m" | "d") => {
    showDialog({ focusTarget: target });
  };

  const focus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const blur = (e: FocusEvent<HTMLDivElement>) => {
    if (blurToOuter(e)) {
      closeDialog();
      renderInputs(fi.valueRef.current);
    }
    props.onBlur?.(e);
  };

  const commitChange = () => {
    if (cache.current.y == null || cache.current.m == null || (fi.dataItem.type !== "month" && cache.current.d == null)) {
      fi.set({ value: undefined, edit: true, effect: false });
      return;
    }
    const date = new Date(cache.current.y, cache.current.m - 1, cache.current.d ?? 1);
    fi.set({ value: { date, str: formatDate(date) }, edit: true, effect: false });
  };

  const changeY = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    const v = e.currentTarget.value;
    if (!isNumericOrEmpty(v)) {
      e.currentTarget.value = String(cache.current.y || "");
      return;
    }
    cache.current.y = isEmpty(v) ? undefined : Number(v);
    if (v.length === 4) mref.current?.focus();
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
      if (v.length === 2 || !(v === "1" || v === "2")) dref.current?.focus();
    }
    commitChange();
  };

  const changeD = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    const v = e.currentTarget.value;
    if (!isNumericOrEmpty(v)) {
      e.currentTarget.value = String(cache.current.d || "");
      return;
    }
    cache.current.d = isEmpty(v) ? undefined : Number(v);
    commitChange();
  };

  const updown = (y = 0, m = 0, d = 0) => {
    if (!fi.editable) return;
    const newDate = new Date(
      cache.current.y == null ? $initFocusDate.getFullYear() : cache.current.y + y,
      (cache.current.m == null ? $initFocusDate.getMonth() + 1 : cache.current.m + m) - 1,
      cache.current.d == null ? $initFocusDate.getDate() : cache.current.d + d
    );
    let year = newDate.getFullYear();
    let month = newDate.getMonth() + 1;
    let day = newDate.getDate();
    if (minDate) {
      if (isBeforeDate(minDate, newDate)) {
        year = minDate.getFullYear();
        month = minDate.getMonth() + 1;
        day = minDate.getDate();
      }
    }
    if (maxDate) {
      if (!isBeforeDate(maxDate, newDate)) {
        year = maxDate.getFullYear();
        month = maxDate.getMonth() + 1;
        day = maxDate.getDate();
      }
    }
    if (!(cache.current.d !== day || cache.current.m !== month || cache.current.y !== year)) return;
    const date = new Date(year, month - 1, day);
    fi.set({ value: { date, str: formatDate(date) }, edit: true, effect: true });
  };

  const keydownY = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    switch (e.key) {
      case "F2":
        showDialog({ focusTarget: "y" });
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
        if (e.currentTarget.value.length === 0) yref.current?.focus();
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

  const keydownD = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    switch (e.key) {
      case "F2":
        showDialog({ focusTarget: "d" });
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
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
        data-disabled={fi.disabled}
        data-invalid={fi.iptAria["aria-invalid"]}
      >
        <input
          ref={yref}
          type="text"
          className="ipt-txt ipt-date-y"
          data-name={`${fi.name}_y`}
          placeholder={fi.editable ? placeholder?.[0] : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          autoFocus={fi.autoFocus}
          maxLength={4}
          autoComplete="off"
          inputMode="numeric"
          defaultValue={fi.value?.date?.getFullYear()}
          onClick={() => click("y")}
          onChange={changeY}
          onKeyDown={keydownY}
          onFocus={focus}
          {...fi.iptAria}
          aria-haspopup="dialog"
        />
        <span
          className="ipt-sep"
          onClick={() => click("m")}
        >
          /
        </span>
        <input
          ref={mref}
          type="text"
          className="ipt-txt ipt-date-m"
          data-name={`${fi.name}_m`}
          placeholder={fi.editable ? placeholder?.[1] : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          maxLength={4}
          autoComplete="off"
          inputMode="numeric"
          defaultValue={(() => {
            const m = fi.value?.date?.getMonth();
            if (m == null) return "";
            return m + 1;
          })()}
          onClick={() => click("d")}
          onChange={changeM}
          onKeyDown={keydownM}
          onFocus={focus}
          {...fi.iptAria}
          data-last={fi.dataItem.type === "month" ? "" : undefined}
          aria-haspopup="dialog"
        />
        {fi.dataItem.type !== "month" &&
          <>
            <span
              className="ipt-sep"
              onClick={() => click("d")}
            >
              /
            </span>
            <input
              ref={dref}
              type="text"
              className="ipt-txt ipt-date-d"
              data-name={`${fi.name}_d`}
              placeholder={fi.editable ? placeholder?.[2] : ""}
              disabled={fi.disabled}
              readOnly={fi.readOnly}
              tabIndex={fi.tabIndex}
              maxLength={4}
              autoComplete="off"
              inputMode="numeric"
              defaultValue={fi.value?.date?.getDate()}
              onClick={() => click("d")}
              onChange={changeD}
              onKeyDown={keydownD}
              onFocus={focus}
              {...fi.iptAria}
              data-last=""
              aria-haspopup="dialog"
            />
          </>
        }
        {fi.mountValue &&
          <input
            type="hidden"
            name={fi.name}
            value={empty ? "" : fi.value?.str!}
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
            <CalendarIcon />
          </button>
        }
        {fi.clearButton(empty ? undefined : clear)}
        <Dialog
          modeless
          ref={dialog}
          mobile
          className="ipt-dialog"
        >
          <DatePicker
            type={fi.dataItem.type}
            initValue={$initFocusDate}
            minDate={minDate}
            maxDate={maxDate}
            dialog
            preventSelectedRender
            values={empty ? undefined : [fi.value?.date!]}
            onSelect={({ date, str }) => {
              fi.set({ value: { date, str }, edit: true, effect: true });
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

type DatePickerProps = {
  type?: "date" | "month";
  multiple?: boolean;
  values?: Array<Date>;
  initValue?: Date;
  minDate?: Date | null;
  maxDate?: Date | null;
  firstWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dialog?: boolean;
  preventSelectedRender?: boolean;
  onSelect?: (params: { date: Date; str: string; action?: "clear"; }) => void;
  onCancel?: () => void;
};

export const DatePicker = (props: DatePickerProps) => {
  const lang = useLang();
  const type = props.type ?? "date";
  const values = props.values ?? (props.initValue ? [props.initValue] : []);
  const memorizedValue = (values ?? []).map(v => formatDate(v)).join("");

  const [dispDate, setDispDate] = useReducer((state: Date, { date, act }: { date: Date; act?: "select" | "effect"; }) => {
    if (state.getMonth() === date.getMonth() && state.getFullYear() === date.getFullYear()) return state;
    if (props.preventSelectedRender && act === "select") return state;
    return date;
  }, getFirstDateAtMonth(values?.[0] ?? new Date()));
  const yNum = dispDate.getFullYear();
  const mNum = dispDate.getMonth();
  const dNum = dispDate.getDate();

  const weekCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const w = (i + (props.firstWeek ?? 0)) % 7;
      cells.push(
        <div
          key={w}
          className="ipt-dp-cell"
          data-week={w}
        >
          {Week.ja_s[w]}
        </div>
      );
    }
    return cells;
  }, [props.firstWeek]);

  const monthCells = useMemo(() => {
    const cells: Array<ReactElement> = [];
    if (type === "date") return cells;
    const isSelected = (d: Date) => values?.some(v => equalDate(v, d));
    let hasToday = false;
    const today = new Date();
    const isToday = (d: Date) => !hasToday && (hasToday = (today.getMonth() === d.getMonth() && today.getFullYear() === d.getFullYear()));
    let hasOverMinDate = props.minDate == null;
    const overMaxDate = (d: Date) => hasOverMinDate || (hasOverMinDate = !isBeforeDate(props.minDate!, d));
    let hasReachedMaxDate = false;
    const reachedMaxDate = (d: Date) => hasReachedMaxDate || (hasReachedMaxDate = props.maxDate != null && isAfterDate(props.maxDate, d));

    const cursorDate = new Date(yNum, 0, 1);

    const getCellComponent = ({ key, attrs }: { key: string; attrs?: { [v: string]: string | undefined } }) => {
      const selected = isSelected(cursorDate);
      const str = formatDate(cursorDate);
      const selectable = overMaxDate(cursorDate) && !reachedMaxDate(cursorDate);

      return (
        <button
          {...attrs}
          key={key}
          className="ipt-dp-cell"
          type="button"
          aria-current={selected}
          disabled={!selectable}
          data-target={isToday(cursorDate)}
          onClick={!selectable ? undefined : () => {
            const date = parseDate(str)!;
            props.onSelect?.({
              date, str,
              action: selected && props.multiple ? "clear" : undefined,
            });
          }}
        >
          {Month.ja[cursorDate.getMonth()]}
        </button>
      );
    };

    for (let i = 0; i < 12; i++) {
      cells.push(getCellComponent({ key: `m-${i}` }));
      addMonth(cursorDate, 1);
    }
    return cells;
  }, [
    yNum,
    mNum,
    memorizedValue,
    type,
  ]);

  const dayCells = useMemo(() => {
    const cells: Array<ReactElement> = [];
    if (type === "month") return cells;
    const w = dispDate.getDay();
    const isSelected = (d: Date) => values?.some(v => equalDate(v, d));
    let hasToday = false;
    const today = new Date();
    const isToday = (d: Date) => !hasToday && (hasToday = equalDate(today, d));
    let hasOverMinDate = props.minDate == null;
    const overMaxDate = (d: Date) => hasOverMinDate || (hasOverMinDate = !isBeforeDate(props.minDate!, d));
    let hasReachedMaxDate = false;
    const reachedMaxDate = (d: Date) => hasReachedMaxDate || (hasReachedMaxDate = props.maxDate != null && isAfterDate(props.maxDate, d));

    const prevDayCount = (w > 3 ? w : 7 + w) - (props.firstWeek ?? 0);
    const cursorDate = addDay(new Date(dispDate), -prevDayCount);

    const getCellComponent = ({ key, attrs }: { key: string; attrs?: { [v: string]: string | undefined } }) => {
      const selected = isSelected(cursorDate);
      const str = formatDate(cursorDate);
      const selectable = overMaxDate(cursorDate) && !reachedMaxDate(cursorDate);

      return (
        <button
          {...attrs}
          key={key}
          className="ipt-dp-cell"
          type="button"
          aria-current={selected}
          disabled={!selectable}
          data-target={isToday(cursorDate)}
          onClick={!selectable ? undefined : () => {
            const date = parseDate(str)!;
            props.onSelect?.({
              date, str,
              action: selected && props.multiple ? "clear" : undefined,
            });
            setDispDate({
              date: new Date(date.getFullYear(), date.getMonth(), 1),
              act: "select",
            });
          }}
        >
          {cursorDate.getDate()}
        </button>
      );
    };

    for (let i = 0; i < prevDayCount; i++) {
      cells.push(getCellComponent({ key: `p-${i}`, attrs: { "data-prev": "" } }));
      addDay(cursorDate, 1);
    }

    for (let i = 0, il = getLastDateAtMonth(dispDate).getDate(); i < il; i++) {
      cells.push(getCellComponent({ key: `c-${i}` }));
      addDay(cursorDate, 1);
    }

    let nextDayCount = 7 - cells.length % 7;
    if (nextDayCount < 4) nextDayCount += 7;
    for (let i = 0; i < nextDayCount; i++) {
      cells.push(getCellComponent({ key: `n-${i}`, attrs: { "data-next": "" } }));
      addDay(cursorDate, 1);
    }

    return cells;
  }, [
    yNum,
    mNum,
    dNum,
    memorizedValue,
    type,
  ]);

  const prevYearDisabled = props.minDate != null && yNum - 1 < props.minDate.getFullYear();
  const prevYear = () => {
    if (prevYearDisabled) return;
    setDispDate({ date: new Date(yNum - 1, mNum, 1) });
  };

  const nextYearDisabled = props.maxDate != null && yNum + 1 > props.maxDate.getFullYear();
  const nextYear = () => {
    if (nextYearDisabled) return;
    setDispDate({ date: new Date(yNum + 1, mNum, 1) });
  };

  const prevMonthDisabled = (() => {
    if (props.minDate == null) return false;
    let m = mNum - 1;
    const y = m < 0 ? yNum - 1 : yNum;
    m = (m + 12) % 12;
    return y * 100 + m < props.minDate.getFullYear() * 100 + props.minDate.getMonth();
  })();
  const prevMonth = () => {
    if (prevMonthDisabled) return;
    setDispDate({ date: new Date(yNum, mNum - 1, 1) });
  };

  const nextMonthDisabled = (() => {
    if (props.maxDate == null) return false;
    let m = mNum + 1;
    const y = m >= 12 ? yNum + 1 : yNum;
    m = m % 12;
    return y * 100 + m > props.maxDate.getFullYear() * 100 + props.maxDate.getMonth();
  })();
  const nextMonth = () => {
    if (nextMonthDisabled) return;
    setDispDate({ date: new Date(yNum, mNum + 1, 1) });
  };

  const wheel = (e: WheelEvent<HTMLDivElement>) => {
    if (type === "month") {
      if (e.deltaY > 0) nextYear();
      else prevYear();
      return;
    }
    if (e.deltaY > 0) nextMonth();
    else prevMonth();
  };

  const touchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = e.touches[0].pageX;
    let moveX = 0;

    const move = (e: TouchEvent) => {
      moveX = e.changedTouches[0].pageX - startX;
    };
    const end = (e: TouchEvent) => {
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchmove", move);
      if (Math.abs(moveX) > 80) {
        if (type === "month") {
          if (moveX > 0) nextYear();
          else prevYear();
        } else {
          if (moveX > 0) nextMonth();
          else prevMonth();
        }
      }
    };
    window.addEventListener("touchend", end);
    window.addEventListener("touchmove", move);
  };

  const selectToday = () => {
    const date = withoutTime(new Date());
    if (type === "month") date.setDate(1);
    props.onSelect?.({ date, str: formatDate(date), action: undefined });
    setDispDate({ date, act: "select" });
  };

  useEffect(() => {
    setDispDate({
      date: getFirstDateAtMonth(values[0] ?? new Date()),
      act: "effect",
    });
  }, [memorizedValue]);

  return (
    <div
      className="ipt-dp"
      data-dialog={props.dialog}
    >
      <div
        className="ipt-dp-main"
        onWheel={wheel}
        onTouchStart={touchStart}
      >
        <div
          className="ipt-dp-year"
          data-type={type}
        >
          <button
            className="ipt-btn ipt-prev"
            type="button"
            onClick={prevYear}
            disabled={prevYearDisabled}
          >
            <LeftIcon />
          </button>
          <span>
            {yNum}
          </span>
          <button
            className="ipt-btn ipt-next"
            type="button"
            onClick={nextYear}
            disabled={nextYearDisabled}
          >
            <RightIcon />
          </button>
        </div>
        {type === "date" &&
          <>
            <span className="ipt-dp-sep">/</span>
            <div className="ipt-dp-month">
              <button
                className="ipt-btn ipt-prev"
                type="button"
                onClick={prevMonth}
                disabled={prevMonthDisabled}
              >
                <LeftIcon />
              </button>
              <span>
                {mNum + 1}
              </span>
              <button
                className="ipt-btn ipt-next"
                type="button"
                onClick={nextMonth}
                disabled={nextMonthDisabled}
              >
                <RightIcon />
              </button>
            </div>
            <div className="ipt-dp-week">
              {weekCells}
            </div>
            <div className="ipt-dp-date">
              {dayCells}
            </div>
          </>
        }
        {type === "month" &&
          <div
            className="ipt-dp-month"
            data-type={type}
          >
            {monthCells}
          </div>
        }
      </div>
      <div className="ipt-dp-btns">
        {props.onCancel &&
          <button
            className="ipt-btn"
            type="button"
            title={lang("common.cancel")}
            onClick={() => {
              props.onCancel!();
            }}
          >
            <CrossIcon />
          </button>
        }
        <button
          className="ipt-btn"
          type="button"
          title={lang("form.today")}
          onClick={selectToday}
        >
          <TodayIcon />
        </button>
        <button
          className="ipt-btn"
          type="button"
          title={lang("form.dispCurrent")}
          onClick={() => {
            setDispDate({
              date: getFirstDateAtMonth(values[0] ?? new Date()),
              act: "effect",
            });
          }}
        >
          <UndoIcon />
        </button>
      </div>
    </div>
  );
};
