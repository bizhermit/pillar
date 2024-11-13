"use client";

import { type ChangeEvent, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, useMemo, useRef } from "react";
import { $dateParse } from "../../../../data-items/date/parse";
import { $dateValidations } from "../../../../data-items/date/validation";
import { blurToOuter } from "../../../../dom/outer-event";
import { equals } from "../../../../objects";
import { addDay, addMonth, formatDate, getFirstDateAtMonth, getLastDateAtMonth, isAfterDate, isBeforeDate, parseDate, withoutTime } from "../../../../objects/date";
import { DateTime } from "../../../../objects/datetime";
import { parseNum } from "../../../../objects/number";
import { isEmpty } from "../../../../objects/string";
import { get, set } from "../../../../objects/struct";
import { Dialog, useDialogRef } from "../../dialog";
import { DownFillIcon } from "../../icon";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type DataValue = {
  str: string | null | undefined;
  date: Date | null | undefined;
  y: number | null | undefined;
  m: number | null | undefined;
  d: number | null | undefined;
};

type DateSelectBoxOptions<D extends DataItem.$date | DataItem.$month | undefined> =
  FormItemOptions<D, D extends DataItem.$date | DataItem.$month ? DataItem.ValueType<D> : string, DataValue, Date | string | number | DateTime> & {
    type?: "date" | "month";
    min?: DataItem.$date["min"];
    max?: DataItem.$date["max"];
    pair?: DataItem.$date["pair"];
    initFocusDate?: Date | string | number | DateTime;
    placeholder?: string | [string, string] | [string, string, string];
    splitDataNames?: [string, string] | [string, string, string];
    allowMissing?: boolean;
  };

type DateSelectBoxProps<D extends DataItem.$date | DataItem.$month | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, DateSelectBoxOptions<D>>;

type Target = "y" | "m" | "d";

const listItemClassName = "ipt-list-item";

const isNumericOrEmpty = (value?: string): value is `${number}` => {
  if (isEmpty(value)) return true;
  return /^[0-9]+$/.test(value);
};

const defaultMinDate = new Date(1900, 0, 1);
const defaultMaxDate = new Date(2100, 11, 31);

export const DateSelectBox = <D extends DataItem.$date | DataItem.$month | undefined>({
  type,
  min,
  max,
  pair,
  initFocusDate,
  placeholder,
  splitDataNames,
  allowMissing,
  ...props
}: DateSelectBoxProps<D>) => {
  const today = withoutTime(new Date());
  const yref = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement>(null!);
  const cache = useRef<{ y: number | undefined; m: number | undefined; d: number | undefined; }>({ y: undefined, m: undefined, d: undefined });
  const yDialog = useDialogRef(true);
  const mDialog = useDialogRef(true);
  const dDialog = useDialogRef(true);
  const dialog = (target: Target) => {
    switch (target) {
      case "d": return dDialog;
      case "m": return mDialog;
      default: return yDialog;
    }
  };

  const focusInput = (target?: Target) => {
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
      cache.current.y = v?.y ?? undefined;
      cache.current.m = v?.m == null ? undefined : v.m + 1;
      cache.current.d = v?.d ?? undefined;
      yref.current.value = String(cache.current.y ?? "");
      mref.current.value = String(cache.current.m ?? "");
      if (dref.current) dref.current.value = String(cache.current.d ?? "");
      return;
    }
    yref.current.value = String(cache.current.y = d.getFullYear());
    mref.current.value = String(cache.current.m = d.getMonth() + 1);
    cache.current.d = d.getDate();
    if (dref.current) dref.current.value = String(cache.current.d);
  };

  const fi = useFormItemCore<DataItem.$date | DataItem.$month, D, string, DataValue, Date | string | number | DateTime>(props, {
    dataItemDeps: [type, min, max, pair?.name, pair?.position, pair?.same, allowMissing, ...(splitDataNames ?? [])],
    getDataItem: ({ dataItem, refs }) => {
      const $pair = pair ?? dataItem?.pair;
      return {
        type: type ?? dataItem?.type ?? "date",
        min: min ?? dataItem?.min,
        max: max ?? dataItem?.max,
        pair: $pair,
        refs: $pair ? [$pair.name, ...(refs ?? [])] : refs,
        splitDataNames: splitDataNames ?? dataItem?.splitDataNames,
      };
    },
    getTieInNames: ({ dataItem }) => dataItem.splitDataNames,
    parse: () => {
      return (p, { bind }) => {
        const [d, r] = $dateParse(p);
        if (d == null) {
          if (bind && p.dataItem.splitDataNames) {
            const m = parseNum(get(p.data, p.dataItem.splitDataNames[1])[0]);
            return [{
              str: undefined, date: undefined,
              y: parseNum(get(p.data, p.dataItem.splitDataNames[0])[0]),
              m: m == null ? undefined : m - 1,
              d: p.dataItem.splitDataNames[2] ? parseNum(get(p.data, p.dataItem.splitDataNames[2])[0]) : undefined,
            }, r];
          }
          return [{ str: undefined, date: undefined, y: undefined, m: undefined, d: undefined }, r];
        }
        return [{ str: formatDate(d), date: d, y: d.getFullYear(), m: d.getMonth(), d: d.getDate() }, r];
      };
    },
    revert: (v) => v?.str,
    effect: ({ edit, value, effect }) => {
      if (yref.current && (!edit || effect)) renderInputs(value);
    },
    equals: (v1, v2, { dataItem }) => {
      return equals(v1?.str, v2?.str) && equals(v1?.y, v2?.y) && equals(v1?.m, v2?.m) && (dataItem.type === "month" || equals(v1?.d, v2?.d));
    },
    validation: ({ dataItem, env, iterator, label }) => {
      const funcs = $dateValidations({ dataItem, env }, { skipRequired: allowMissing });
      return (v, p) => {
        if (allowMissing) {
          const required = typeof p.dataItem.required === "function" ? p.dataItem.required(p) : p.dataItem.required;
          if (required) {
            if (v?.y == null && v?.m == null && (p.dataItem.type === "month" || v?.d == null)) {
              return { type: "e", code: "required", fullName: p.fullName, msg: `${label}を入力してください。` };
            }
          }
        } else {
          if (v?.y != null || v?.m != null || (p.dataItem.type !== "month" && v?.d != null)) {
            const parts: Array<string> = [];
            if (v.y == null) parts.push("年");
            if (v.m == null) parts.push("月");
            if (v.d == null) parts.push("日");
            if (parts.length > 0) {
              return { type: "e", code: "lack", fullName: p.fullName, msg: `${label}に${parts.join("と")}を入力してください。` };
            }
          }
        }
        return iterator(funcs, { ...p, value: v?.date });
      };
    },
    setBind: ({ data, name, value, dataItem }) => {
      if (name) set(data, name, value?.str);
      if (dataItem.splitDataNames) {
        set(data, dataItem.splitDataNames[0], value?.y);
        set(data, dataItem.splitDataNames[1], value?.m == null ? value?.m : value.m + 1);
        if (dataItem.splitDataNames[2]) {
          set(data, dataItem.splitDataNames[2], value?.d);
        }
      }
    },
    focus: focusInput,
  });

  if (fi.dataItem.type === "month") today.setDate(1);

  const minDate = useMemo(() => {
    const min = parseDate(typeof fi.dataItem.min === "function" ? fi.dataItem.min() : fi.dataItem.min);
    const d = withoutTime(min ?? defaultMinDate);
    if (fi.dataItem.type === "month") {
      return getFirstDateAtMonth(d);
    }
    return d;
  }, [fi.dataItem.min]);

  const maxDate = useMemo(() => {
    const max = parseDate(typeof fi.dataItem.max === "function" ? fi.dataItem.max() : fi.dataItem.max);
    const d = withoutTime(max ?? defaultMaxDate);
    if (fi.dataItem.type === "month") {
      return getLastDateAtMonth(d);
    }
    return d;
  }, [fi.dataItem.max]);

  const $initFocusDate = useMemo(() => {
    return withoutTime(parseDate(initFocusDate) ?? today);
  }, [initFocusDate]);

  const empty = isEmpty(fi.value?.str);
  const selectEmpty = fi.value?.y == null && fi.value?.m == null && (fi.dataItem.type === "month" || fi.value?.d == null);

  const findSelectedOrFirstItemElem = (target: Target) => {
    const pElem = (() => {
      switch (target) {
        case "d": return dref.current?.parentElement;
        case "m": return mref.current?.parentElement;
        default: return yref.current?.parentElement;
      }
    })();
    if (!pElem) return;
    const elem = pElem.querySelector(`dialog .${listItemClassName}[aria-current="true"]`) ?? pElem.querySelector(`dialog .${listItemClassName}`);
    if (!elem) return;
    return elem as HTMLDivElement;
  };

  const focusSelected = (target: Target, opts?: { preventFocus?: boolean; preventScroll?: boolean; }) => {
    const elem = findSelectedOrFirstItemElem(target);
    if (elem == null) return;
    if (!opts?.preventFocus) elem.focus();
    if (!opts?.preventScroll) elem.scrollIntoView({ block: "center" });
  };

  const showDialog = (target: Target) => {
    const d = dialog(target);
    if (!fi.editable || d.showed) return;
    const anchorElem = (() => {
      switch (target) {
        case "d": return dref.current?.parentElement;
        case "m": return mref.current?.parentElement;
        default: return yref.current?.parentElement;
      }
    })();
    if (!anchorElem) return;
    focusInput(target);
    d.open({
      anchor: {
        element: anchorElem,
        x: "inner",
        y: "outer",
        width: "fill",
      },
      callbackBeforeAnimation: () => {
        focusInput(target);
      },
      callback: () => {
        focusSelected(target, {
          preventFocus: true,
        });
      }
    });
  };

  const closeDialog = (target: Target, focus?: boolean) => {
    if (focus) {
      switch (target) {
        case "d":
          if (cache.current.y == null) {
            showDialog("y");
          } else if (cache.current.m == null) {
            showDialog("m");
          } else {
            focusInput(target);
          }
          break;
        case "m":
          if (cache.current.y == null) {
            showDialog("y");
          } else if (cache.current.m != null && fi.dataItem.type !== "month") {
            if (cache.current.d == null) showDialog("d");
            else dref.current?.focus();
          } else {
            focusInput(target);
          }
          break;
        default:
          if (cache.current.y != null) {
            if (cache.current.m == null) {
              showDialog("m");
            } else {
              if (cache.current.d == null) showDialog("d");
              else mref.current?.focus();
            }
          } else {
            focusInput(target);
          }
          break;
      }
    }
    dialog(target).close();
  };

  const click = (target: Target) => {
    showDialog(target);
  };

  const blur = (e: FocusEvent<HTMLDivElement>, target: Target) => {
    if (blurToOuter(e)) closeDialog(target);
  };

  const blurWrap = (e: FocusEvent<HTMLDivElement>) => {
    if (blurToOuter(e)) renderInputs(fi.valueRef.current);
    props.onBlur?.(e);
  };

  const commitChange = () => {
    if (cache.current.y == null || cache.current.m == null || (fi.dataItem.type !== "month" && cache.current.d == null)) {
      fi.set({
        value: {
          date: undefined,
          str: undefined,
          y: cache.current.y,
          m: cache.current.m == null ? undefined : cache.current.m - 1,
          d: cache.current.d,
        },
        edit: true,
      });
      return;
    }
    const date = new Date(cache.current.y, cache.current.m - 1, cache.current.d ?? 1);
    fi.set({
      value: {
        date,
        str: formatDate(date),
        y: date.getFullYear(),
        m: date.getMonth(),
        d: date.getDate(),
      },
      edit: true,
    });
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
    fi.set({
      value: {
        date,
        str: formatDate(date),
        y: year,
        m: month,
        d: day,
      },
      edit: true,
      effect: true
    });
    focusSelected(y !== 0 ? "y" : m !== 0 ? "m" : "d", { preventFocus: true });
  };

  const keydownY = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    switch (e.key) {
      case "F2":
        showDialog("y");
        break;
      case "Enter":
        renderInputs(fi.value);
        closeDialog("y");
        break;
      case "Escape":
        closeDialog("y");
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
        showDialog("m");
        break;
      case "Enter":
        renderInputs(fi.value);
        closeDialog("m");
        break;
      case "Escape":
        closeDialog("m");
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
        showDialog("d");
        break;
      case "Enter":
        renderInputs(fi.value);
        closeDialog("d");
        break;
      case "Escape":
        closeDialog("d");
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

  const focus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const clear = () => {
    if (!fi.editable || selectEmpty) return;
    fi.clear(true);
    focusInput("y");
  };

  const yearItems = useMemo(() => {
    const items: Array<ReactElement> = [];
    const valY = fi.value?.y ?? $initFocusDate.getFullYear();
    const todayY = today.getFullYear();

    for (let i = minDate.getFullYear(), il = maxDate.getFullYear(); i <= il; i++) {
      items.push(
        <ListItem
          key={i}
          currentValue={fi.value?.y}
          value={i}
          empty={fi.value?.y == null}
          today={todayY === i}
          onSelect={() => {
            yref.current.value = String(cache.current.y = i);
            commitChange();
            closeDialog("y", true);
          }}
          onEscape={() => closeDialog("y", true)}
          initFocusValue={valY}
        >
          {i}
        </ListItem>
      );
    }
    return items;
  }, [
    minDate,
    maxDate,
    $initFocusDate,
    fi.value?.y,
    fi.editable,
  ]);

  const monthItems = useMemo(() => {
    const items: Array<ReactElement> = [];
    const valM = fi.value?.m ?? $initFocusDate.getMonth();
    const todayM = today.getMonth();

    let hasOverMinDate = minDate == null;
    const overMaxDate = (d: Date) => hasOverMinDate || (hasOverMinDate = !isBeforeDate(minDate!, d));
    let hasReachedMaxDate = false;
    const reachedMaxDate = (d: Date) => hasReachedMaxDate || (hasReachedMaxDate = maxDate != null && isAfterDate(maxDate, d));

    const cursorDate = new Date(fi.value?.y ?? $initFocusDate.getFullYear(), 0, 1);

    for (let i = 0; i < 12; i++) {
      const selectable = overMaxDate(cursorDate) && !reachedMaxDate(cursorDate);
      items.push(
        <ListItem
          key={i}
          currentValue={fi.value?.m}
          value={i}
          empty={fi.value?.m == null}
          disabled={!selectable}
          today={todayM === i}
          onSelect={() => {
            mref.current.value = String(cache.current.m = i + 1);
            commitChange();
            closeDialog("m", true);
          }}
          onEscape={() => closeDialog("m", true)}
          initFocusValue={valM}
        >
          {i + 1}
        </ListItem>
      );
      addMonth(cursorDate, 1);
    }
    return items;
  }, [
    minDate,
    maxDate,
    $initFocusDate,
    fi.value?.y,
    fi.value?.m,
    fi.editable,
  ]);

  const dayItems = useMemo(() => {
    const items: Array<ReactElement> = [];
    const valD = fi.value?.d ?? $initFocusDate.getDate();
    const todayD = today.getDate();

    let hasOverMinDate = minDate == null;
    const overMaxDate = (d: Date) => hasOverMinDate || (hasOverMinDate = !isBeforeDate(minDate!, d));
    let hasReachedMaxDate = false;
    const reachedMaxDate = (d: Date) => hasReachedMaxDate || (hasReachedMaxDate = maxDate != null && isAfterDate(maxDate, d));

    const cursorDate = new Date(fi.value?.y ?? $initFocusDate.getFullYear(), (fi.value?.m ?? $initFocusDate.getMonth()) + 1, 0);
    const max = cursorDate.getDate();
    cursorDate.setDate(1);

    for (let i = 0; i < max; i++) {
      const selectable = overMaxDate(cursorDate) && !reachedMaxDate(cursorDate);
      const d = i + 1;

      items.push(
        <ListItem
          key={d}
          currentValue={fi.value?.d}
          value={d}
          empty={fi.value?.d == null}
          disabled={!selectable}
          today={todayD === d}
          onSelect={() => {
            dref.current.value = String(cache.current.d = d);
            commitChange();
            closeDialog("d", true);
          }}
          onEscape={() => closeDialog("d", true)}
          initFocusValue={valD}
        >
          {d}
        </ListItem>
      );
      addDay(cursorDate, 1);
    }
    return items;
  }, [
    $initFocusDate,
    minDate,
    maxDate,
    fi.value?.y,
    fi.value?.m,
    fi.value?.d,
    fi.editable,
  ]);

  return (
    <>
      <div
        {...fi.props}
        className={joinClassNames("ipt-row ipt-date", props.className)}
        onBlur={blurWrap}
      >
        <div
          className="ipt-field"
          onClick={() => click("y")}
          onBlur={(e) => blur(e, "y")}
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
            onChange={changeY}
            onKeyDown={keydownY}
            onFocus={focus}
            {...fi.iptAria}
            aria-haspopup="listbox"
          />
          {fi.showButtons &&
            <button
              className="ipt-btn ipt-pull"
              type="button"
              disabled={!fi.editable || yDialog.showed}
              tabIndex={-1}
              aria-haspopup="listbox"
              aria-expanded={yDialog.showed}
              data-slim
            >
              <DownFillIcon />
            </button>
          }
          <Dialog
            modeless
            ref={yDialog}
            mobile
            className="ipt-dialog ipt-dialog-list"
          >
            <div
              className="ipt-list"
              role="listbox"
              data-align="center"
            >
              {yearItems}
            </div>
          </Dialog>
        </div>
        <span className="ipt-sep">年</span>
        <div
          className="ipt-field"
          onClick={() => click("m")}
          onBlur={(e) => blur(e, "m")}
          data-disabled={fi.disabled}
          data-invalid={fi.iptAria["aria-invalid"]}
        >
          <input
            ref={mref}
            type="text"
            className="ipt-txt ipt-date-m"
            data-name={`${fi.name}_m`}
            placeholder={fi.editable ? placeholder?.[1] : ""}
            disabled={fi.disabled}
            readOnly={fi.readOnly}
            tabIndex={fi.tabIndex}
            maxLength={2}
            autoComplete="off"
            inputMode="numeric"
            defaultValue={(() => {
              const m = fi.value?.m;
              if (m == null) return "";
              return m + 1;
            })()}
            onChange={changeM}
            onKeyDown={keydownM}
            onFocus={focus}
            {...fi.iptAria}
            aria-haspopup="listbox"
          />
          {fi.showButtons &&
            <button
              className="ipt-btn ipt-pull"
              type="button"
              disabled={!fi.editable || mDialog.showed}
              tabIndex={-1}
              aria-haspopup="listbox"
              aria-expanded={mDialog.showed}
              data-slim
            >
              <DownFillIcon />
            </button>
          }
          <Dialog
            modeless
            ref={mDialog}
            mobile
            className="ipt-dialog ipt-dialog-list"
          >
            <div
              className="ipt-list"
              role="listbox"
              data-align="center"
            >
              {monthItems}
            </div>
          </Dialog>
        </div>
        <span className="ipt-sep">月</span>
        {fi.dataItem.type === "date" &&
          <>
            <div
              className="ipt-field"
              onClick={() => click("d")}
              onBlur={(e) => blur(e, "d")}
              data-disabled={fi.disabled}
              data-invalid={fi.iptAria["aria-invalid"]}
            >
              <input
                ref={dref}
                type="text"
                className="ipt-txt ipt-date-d"
                data-name={`${fi.name}_d`}
                placeholder={fi.editable ? placeholder?.[2] : ""}
                disabled={fi.disabled}
                readOnly={fi.readOnly}
                tabIndex={fi.tabIndex}
                maxLength={2}
                autoComplete="off"
                inputMode="numeric"
                defaultValue={fi.value?.d ?? ""}
                onChange={changeD}
                onKeyDown={keydownD}
                onFocus={focus}
                {...fi.iptAria}
                aria-haspopup="listbox"
              />
              {fi.showButtons &&
                <button
                  className="ipt-btn ipt-pull"
                  type="button"
                  disabled={!fi.editable || dDialog.showed}
                  tabIndex={-1}
                  aria-haspopup="listbox"
                  aria-expanded={dDialog.showed}
                  data-slim
                >
                  <DownFillIcon />
                </button>
              }
              <Dialog
                modeless
                ref={dDialog}
                mobile
                className="ipt-dialog ipt-dialog-list"
              >
                <div
                  className="ipt-list"
                  role="listbox"
                  data-align="center"
                >
                  {dayItems}
                </div>
              </Dialog>
            </div>
            <span className="ipt-sep">日</span>
          </>
        }
        {fi.mountValue &&
          <>
            <input
              type="hidden"
              name={fi.name}
              value={empty ? "" : fi.value?.str!}
              disabled={fi.disabled}
            />
            {fi.dataItem.splitDataNames &&
              <>
                <input
                  type="hidden"
                  name={fi.dataItem.splitDataNames[0]}
                  value={fi.value?.y ?? ""}
                />
                <input
                  type="hidden"
                  name={fi.dataItem.splitDataNames[1]}
                  value={fi.value?.m == null ? "" : fi.value.m + 1}
                />
                {fi.dataItem.splitDataNames[2] &&
                  <input
                    type="hidden"
                    name={fi.dataItem.splitDataNames[2]}
                    value={fi.value?.d ?? ""}
                  />
                }
              </>
            }
          </>
        }
        {!selectEmpty && fi.clearButton(selectEmpty ? undefined : clear)}
      </div>
      {fi.messageComponent}
    </>
  );
};

type ListItemProps = {
  onSelect: () => void;
  onEscape: () => void;
  value: any;
  currentValue: any;
  initFocusValue: any;
  empty: boolean;
  disabled?: boolean;
  today: boolean;
  children: ReactNode;
};

const ListItem = ({
  onSelect,
  onEscape,
  value,
  currentValue,
  initFocusValue,
  empty,
  disabled,
  today,
  children,
}: ListItemProps) => {
  const selected = (!empty && equals(value, currentValue)) || (empty ? equals(initFocusValue, value) : false);

  const keydown = (e: KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "Enter":
        if (disabled) return;
        onSelect();
        break;
      case "Escape":
        onEscape();
        break;
      case "ArrowUp":
        const prevElem = e.currentTarget.previousElementSibling as HTMLElement;
        if (prevElem) {
          prevElem.focus();
          prevElem.scrollIntoView({ block: "center" });
        }
        break;
      case "ArrowDown":
        const nextElem = e.currentTarget.nextElementSibling as HTMLElement;
        if (nextElem) {
          nextElem.focus();
          nextElem.scrollIntoView({ block: "center" });
        }
        break;
      default:
        break;
    }
  };

  return (
    <button
      className={listItemClassName}
      role="listitem"
      type="button"
      tabIndex={-1}
      autoFocus={selected}
      aria-current={selected}
      disabled={disabled}
      data-target={today}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={keydown}
    >
      {children}
    </button>
  );
};
