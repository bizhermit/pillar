import { $dateParse } from "@/data-items/date/parse";
import { $dateValidations } from "@/data-items/date/validation";
import { formatDate, getFirstDateAtMonth, getLastDateAtMonth, isBeforeDate, parseDate, withoutTime } from "@/objects/date";
import { isEmpty } from "@/objects/string";
import { setValue } from "@/objects/struct";
import { ChangeEvent, FocusEvent, HTMLAttributes, KeyboardEvent, useMemo, useRef } from "react";
import { Dialog, useDialog } from "../../dialog";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type DataValue = { str: string | null | undefined; date: Date | null | undefined; };

type DateBoxOptions<D extends DataItem.$date | DataItem.$month | undefined> =
  FormItemOptions<D, D extends DataItem.$date | DataItem.$month ? DataItem.ValueType<D> : string, DataValue> &
  {
    min?: string;
    max?: string;
    pair?: {
      name: string;
      position: "before" | "after";
      same?: boolean;
    };
    initFocusDate?: string;
  };

type DateBoxProps<D extends DataItem.$date | DataItem.$month | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, DateBoxOptions<D>>;

const isNumericOrEmpty = (value?: string): value is `${number}` => {
  if (isEmpty(value)) return true;
  return /^[0-9]+$/.test(value);
};

export const DateBox = <D extends DataItem.$date | DataItem.$month | undefined>({
  min,
  max,
  pair,
  initFocusDate,
  ...props
}: DateBoxProps<D>) => {
  const yref = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement>(null!);
  const cache = useRef<{ y: number | undefined; m: number | undefined; d: number | undefined; }>({ y: undefined, m: undefined, d: undefined });
  const dialog = useDialog();

  const focusInput = (target?: "y" | "m" | "d") => {
    switch (target) {
      case "y":
        yref.current?.focus();
        break;
      case "m":
        mref.current?.focus();
        break;
      case "d":
        dref.current?.focus();
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
      dref.current.value = "";
      cache.current.y = undefined;
      cache.current.m = undefined;
      cache.current.d = undefined;
      return;
    }
    yref.current.value = String(cache.current.y = d.getFullYear());
    mref.current.value = String(cache.current.m = d.getMonth() + 1);
    dref.current.value = String(cache.current.d = d.getDate());
  };

  const fi = useFormItemCore<DataItem.$date | DataItem.$month, D, string, DataValue>(props, {
    dataItemDeps: [min, max, pair?.name, pair?.position, pair?.same],
    getDataItem: ({ dataItem }) => {
      return {
        type: "date",
        ...dataItem,
        min: min ?? dataItem?.min,
        max: max ?? dataItem?.max,
        pair: pair ?? dataItem?.pair,
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
    validation: ({ dataItem, iterator }) => {
      const funcs = $dateValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    setBind: ({ data, name, value }) => {
      setValue(data, name, value?.str);
    },
    focus: focusInput,
  });

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
    return withoutTime(parseDate(initFocusDate) ?? new Date());
  }, [initFocusDate]);

  const empty = isEmpty(fi.value?.str);

  const showDialog = (opts?: {
    focusTarget?: "y" | "m" | "d";
  }) => {
    if (!fi.editable || dialog.state !== "closed") return;
    const anchorElem = yref.current?.parentElement;
    if (!anchorElem) return;
    if (opts?.focusTarget) {
      focusInput(opts.focusTarget);
    }
    dialog.open({
      modal: false,
      anchor: {
        element: anchorElem,
        x: "inner",
        y: "outer",
        width: "fill",
      },
      callback: () => {
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
    if (cache.current.y == null || cache.current.m == null || (fi.dataItem.type !== "month" && cache.current.d == null)) {
      fi.set({ value: undefined, edit: true });
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
    cache.current.m = isEmpty(v) ? undefined : Number(v);
    if (v.length === 2 || !(v === "1" || v === "2")) dref.current?.focus();
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
    fi.set({ value: undefined, edit: true, effect: true, parse: true });
    focusInput();
  };

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
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
          onClick={() => click("y")}
          onChange={changeY}
          onKeyDown={keydownY}
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
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          maxLength={4}
          autoComplete="off"
          inputMode="numeric"
          defaultValue={(() => {
            const m = fi.value?.date?.getMonth();
            if (m == null) return undefined;
            return m + 1;
          })()}
          onClick={() => click("d")}
          onChange={changeM}
          onKeyDown={keydownM}
          data-invalid={fi.airaProps["data-invalid"]}
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
              data-invalid={fi.airaProps["data-invalid"]}
            />
          </>
        }
        {fi.inputted &&
          <input
            type="hidden"
            name={fi.name}
            value={empty ? undefined : fi.value?.str!}
            disabled={fi.disabled}
          />
        }
        {fi.showButtons &&
          <div
            className="ipt-btn ipt-pull"
            data-disabled={!fi.editable || dialog.state !== "closed"}
            onClick={clickPull}
            tabIndex={-1}
            data-showed={dialog.state !== "closed"}
          />
        }
        {!fi.hideClearButton && fi.showButtons &&
          <div
            className="ipt-btn"
            data-disabled={!fi.editable || empty}
            onClick={clear}
            tabIndex={-1}
          >
            ×
          </div>
        }
        <Dialog
          hook={dialog.hook}
          mobile
          className="ipt-dialog"
        >
          <div
            className="ipt-dialog-date"
          >
            DatePickerめんどい
          </div>
        </Dialog>
      </div>
      {fi.messageComponent}
    </>
  );
};
