import { $dateParse } from "@/data-items/date/parse";
import { $dateValidations } from "@/data-items/date/validation";
import { formatDate } from "@/objects/date";
import { ChangeEvent, FocusEvent, HTMLAttributes, useRef } from "react";
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
  };

type DateBoxProps<D extends DataItem.$date | DataItem.$month | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, DateBoxOptions<D>>;

export const DateBox = <D extends DataItem.$date | DataItem.$month | undefined>({
  min,
  max,
  pair,
  ...props
}: DateBoxProps<D>) => {
  const yref = useRef<HTMLInputElement>(null!);
  const mref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement>(null!);
  const focusInput = () => (dref.current ?? mref.current)?.focus();
  const dialog = useDialog();

  const renderInputs = (v: DataValue | null | undefined) => {
    const d = v?.date;
    if (d == null) {
      yref.current.value = "";
      mref.current.value = "";
      dref.current.value = "";
      return;
    }
    yref.current.value = String(d.getFullYear());
    mref.current.value = String(d.getMonth() + 1);
    dref.current.value = String(d.getDate());
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
    focus: focusInput,
  });

  const empty = fi.value?.str == null;

  const showDialog = (opts?: {
    preventFocus?: boolean;
    preventScroll?: boolean;
  }) => {
    if (!fi.editable || dialog.state !== "closed") return;
    if (!opts?.preventFocus) focusInput();
    const anchorElem = yref.current?.parentElement;
    if (!anchorElem) return;
    dialog.open({
      modal: false,
      anchor: {
        element: anchorElem,
        x: "inner",
        y: "outer",
        width: "fill",
      },
      callback: () => {
        if (opts?.preventFocus) focusInput();
      },
    });
  };

  const closeDialog = (focus?: boolean) => {
    if (focus) focusInput();
    dialog.close();
  };

  const focus = () => {
    showDialog({ preventFocus: true });
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
    renderInputs(fi.value);
    props.onBlur?.(e);
  };

  const changeY = (e: ChangeEvent<HTMLInputElement>) => {

  };

  const changeM = (e: ChangeEvent<HTMLInputElement>) => {

  };

  const changeD = (e: ChangeEvent<HTMLInputElement>) => {

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
          onFocus={focus}
          onChange={changeY}
        />
        <span className="ipt-sep">/</span>
        <input
          ref={mref}
          type="text"
          className="ipt-txt ipt-date-m"
          onFocus={focus}
          onChange={changeM}
        />
        {fi.dataItem.type !== "month" &&
          <>
            <span className="ipt-sep">/</span>
            <input
              ref={dref}
              type="text"
              className="ipt-txt ipt-date-d"
              onFocus={focus}
              onChange={changeD}
            />
          </>
        }
        {fi.inputted &&
          <input
            type="hidden"
            name={fi.name}
            value={empty ? undefined : fi.value.str!}
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
            autoFocus
            tabIndex={-1}
          >
            DatePickerめんどい
          </div>
        </Dialog>
      </div>
      {fi.messageComponent}
    </>
  );
};
