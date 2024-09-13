import { $timeParse } from "@/data-items/time/parse";
import { $timeValidations } from "@/data-items/time/validation";
import { isEmpty } from "@/objects/string";
import { HTMLAttributes, useRef } from "react";
import { Dialog, useDialog } from "../../dialog";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type TimeBoxOptions<D extends DataItem.$time | undefined> =
  FormItemOptions<D, D extends DataItem.$time ? DataItem.ValueType<D> : number> &
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

  const fi = useFormItemCore<DataItem.$time, D, number>(props, {
    dataItemDeps: [mode, min, max, pair?.name, pair?.position, pair?.same],
    getDataItem: ({ dataItem, refs }) => {
      const $pair = pair ?? dataItem?.pair;
      return {
        type: "time",
        min: min ?? dataItem?.min,
        max: dataItem?.max,
        pair: $pair,
        refs: $pair ? [$pair.name, ...(refs ?? [])] : refs,
      };
    },
    parse: () => {
      return (p) => $timeParse(p);
    },
    effect: ({ edit, value, effect }) => {
      if (!edit || effect) renderInputs(value);
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $timeValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: focusInput,
  });

  const renderInputs = (v: number | null | undefined) => {
    if (v == null) {
      if (href.current) href.current.value = "";
      if (mref.current) mref.current.value = "";
      if (sref.current) sref.current.value = "";
      cache.current.h = cache.current.m = cache.current.s = undefined;
      return;
    }
  };

  return (
    <>
      <div
        {...fi.props}
        {...fi.attrs}
        className={joinClassNames("ipt-field", props.className)}
      >
        <span>{fi.value}</span>
        <Dialog
          modeless
          hook={dialog.hook}
          mobile
          className="ipt-dialog"
        >
          time picker
        </Dialog>
      </div>
      {fi.messageComponent}
    </>
  );
};
