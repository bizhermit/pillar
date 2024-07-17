import { type ChangeEvent, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, useMemo, useRef } from "react";
import { $dateParse } from "../../../../data-items/date/parse";
import { $dateValidations } from "../../../../data-items/date/validation";
import { equals } from "../../../../objects";
import { addDay, addMonth, formatDate, getFirstDateAtMonth, getLastDateAtMonth, isAfterDate, isBeforeDate, parseDate, withoutTime } from "../../../../objects/date";
import { isEmpty } from "../../../../objects/string";
import { setValue } from "../../../../objects/struct";
import { Dialog, useDialog } from "../../dialog";
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
  FormItemOptions<D, D extends DataItem.$date | DataItem.$month ? DataItem.ValueType<D> : string, DataValue> & {
    type?: "date" | "month";
    min?: string;
    max?: string;
    pair?: DataItem.$date["pair"];
    initFocusDate?: string;
  };

type DateSelectBoxProps<D extends DataItem.$date | DataItem.$month | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, DateSelectBoxOptions<D>>;

type Target = "y" | "m" | "d";

const listItemClassName = "ipt-dialog-list-item";

const isNumericOrEmpty = (value?: string): value is `${number}` => {
  if (isEmpty(value)) return true;
  return /^[0-9]+$/.test(value);
};

export const DateSelectBox = <D extends DataItem.$date | DataItem.$month | undefined>({
  type,
  min,
  max,
  pair,
  initFocusDate,
  ...props
}: DateSelectBoxProps<D>) => {
  const today = withoutTime(new Date());
  const yref = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement>(null!);
  const cache = useRef<{ y: number | undefined; m: number | undefined; d: number | undefined; }>({ y: undefined, m: undefined, d: undefined });
  const yDialog = useDialog();
  const mDialog = useDialog();
  const dDialog = useDialog();
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
      yref.current.value = "";
      mref.current.value = "";
      if (dref.current) dref.current.value = "";
      cache.current.y = undefined;
      cache.current.m = undefined;
      cache.current.d = undefined;
      return;
    }
    yref.current.value = String(cache.current.y = d.getFullYear());
    mref.current.value = String(cache.current.m = d.getMonth() + 1);
    cache.current.d = d.getDate();
    if (dref.current) dref.current.value = String(cache.current.d);
  };

  const fi = useFormItemCore<DataItem.$date | DataItem.$month, D, string, DataValue>(props, {
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
        if (d == null) return [{ str: undefined, date: undefined, y: undefined, m: undefined, d: undefined }, r];
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
    validation: ({ dataItem, iterator }) => {
      const funcs = $dateValidations(dataItem);
      return (v, p) => iterator(funcs, { ...p, value: v?.date });
    },
    setBind: ({ data, name, value }) => {
      setValue(data, name, value?.str);
    },
    focus: focusInput,
  });

  if (fi.dataItem.type === "month") today.setDate(1);

  const minDate = useMemo(() => {
    const d = withoutTime(parseDate(fi.dataItem.min) ?? new Date(1900, 0, 1));
    if (fi.dataItem.type === "month") {
      return getFirstDateAtMonth(d);
    }
    return d;
  }, [fi.dataItem.min]);

  const maxDate = useMemo(() => {
    const d = withoutTime(parseDate(fi.dataItem.max) ?? new Date(2100, 11, 31));
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
    const elem = pElem.querySelector(`dialog .${listItemClassName}[data-selected="true"]`) ?? pElem.querySelector(`dialog .${listItemClassName}`);
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
    if (!fi.editable || d.state !== "closed") return;
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
      modal: false,
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
            showDialog("d");
          } else {
            focusInput(target);
          }
          break;
        default:
          if (cache.current.y != null) {
            showDialog("m");
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
    let elem = e.relatedTarget;
    while (elem) {
      if (elem === e.currentTarget) return;
      elem = elem.parentElement;
    }
    closeDialog(target);
  };

  const blurWrap = (e: FocusEvent<HTMLDivElement>) => {
    let elem = e.relatedTarget;
    while (elem) {
      if (elem === e.currentTarget) return;
      elem = elem.parentElement;
    }
    renderInputs(fi.valueRef.current);
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

  const clear = () => {
    if (!fi.editable || selectEmpty) return;
    fi.set({ value: undefined, edit: true, effect: true, parse: true });
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

    let hasOverMinDate = false;
    const overMaxDate = (d: Date) => hasOverMinDate || (hasOverMinDate = !isBeforeDate(minDate, d));
    let hasReachedMaxDate = false;
    const reachedMaxDate = (d: Date) => hasReachedMaxDate || (hasReachedMaxDate = isAfterDate(maxDate, d));

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

    let hasOverMinDate = false;
    const overMaxDate = (d: Date) => hasOverMinDate || (hasOverMinDate = !isBeforeDate(minDate, d));
    let hasReachedMaxDate = false;
    const reachedMaxDate = (d: Date) => hasReachedMaxDate || (hasReachedMaxDate = isAfterDate(maxDate, d));

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
          {...fi.attrs}
          className="ipt-field"
          onClick={() => click("y")}
          onBlur={(e) => blur(e, "y")}
        >
          <input
            ref={yref}
            type="text"
            className="ipt-txt ipt-date-y"
            disabled={fi.disabled}
            readOnly={fi.readOnly}
            tabIndex={fi.tabIndex}
            maxLength={4}
            autoComplete="off"
            inputMode="numeric"
            defaultValue={fi.value?.date?.getFullYear()}
            onChange={changeY}
            onKeyDown={keydownY}
          />
          {fi.showButtons &&
            <div
              className="ipt-btn ipt-pull"
              data-disabled={!fi.editable || yDialog.state !== "closed"}
              tabIndex={-1}
              data-showed={yDialog.state !== "closed"}
              data-slim
            />
          }
          <Dialog
            hook={yDialog.hook}
            mobile
            className="ipt-dialog"
          >
            <div className="ipt-dialog-list">
              {yearItems}
            </div>
          </Dialog>
        </div>
        <span className="ipt-sep">年</span>
        <div
          {...fi.attrs}
          className="ipt-field"
          onClick={() => click("m")}
          onBlur={(e) => blur(e, "m")}
        >
          <input
            ref={mref}
            type="text"
            className="ipt-txt ipt-date-m"
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
            data-invalid={fi.attrs["data-invalid"]}
          />
          {fi.showButtons &&
            <div
              className="ipt-btn ipt-pull"
              data-disabled={!fi.editable || mDialog.state !== "closed"}
              tabIndex={-1}
              data-showed={mDialog.state !== "closed"}
              data-slim
            />
          }
          <Dialog
            hook={mDialog.hook}
            mobile
            className="ipt-dialog"
          >
            <div className="ipt-dialog-list">
              {monthItems}
            </div>
          </Dialog>
        </div>
        <span className="ipt-sep">月</span>
        {fi.dataItem.type === "date" &&
          <>
            <div
              {...fi.attrs}
              className="ipt-field"
              onClick={() => click("d")}
              onBlur={(e) => blur(e, "d")}
            >
              <input
                ref={dref}
                type="text"
                className="ipt-txt ipt-date-d"
                disabled={fi.disabled}
                readOnly={fi.readOnly}
                tabIndex={fi.tabIndex}
                maxLength={2}
                autoComplete="off"
                inputMode="numeric"
                defaultValue={fi.value?.d ?? ""}
                onChange={changeD}
                onKeyDown={keydownD}
                data-invalid={fi.attrs["data-invalid"]}
              />
              {fi.showButtons &&
                <div
                  className="ipt-btn ipt-pull"
                  data-disabled={!fi.editable || dDialog.state !== "closed"}
                  tabIndex={-1}
                  data-showed={dDialog.state !== "closed"}
                  data-slim
                />
              }
              <Dialog
                hook={dDialog.hook}
                mobile
                className="ipt-dialog"
              >
                <div className="ipt-dialog-list">
                  {dayItems}
                </div>
              </Dialog>
            </div>
            <span className="ipt-sep">日</span>
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
        {fi.clearButton(selectEmpty ? undefined : clear)}
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

  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
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
    <div
      className={listItemClassName}
      tabIndex={-1}
      autoFocus={selected}
      data-selected={selected}
      data-disabled={disabled}
      data-current={today}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={keydown}
    >
      {children}
    </div>
  );
};
