import { $boolParse } from "@/data-items/bool/parse";
import { $boolValidations } from "@/data-items/bool/validation";
import { $numParse } from "@/data-items/number/parse";
import { $numValidations } from "@/data-items/number/validation";
import { $strParse } from "@/data-items/string/parse";
import { $strValidations } from "@/data-items/string/validation";
import { equals } from "@/objects";
import { type LoadableArray, useLoadableArray } from "@/react/hooks/loadable-array";
import { type HTMLAttributes, useMemo, useRef } from "react";
import { Dialog, useDialog } from "../../dialog";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type SourceData = { [v: string]: any };
type SourceTempData<V = any> = { value: V; label: any; } & { [v: string]: any };

type SelectBoxOptions<D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData = SourceTempData<D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean>> =
  FormItemOptions<D, D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean, S> &
  {
    labelDataName?: string;
    valueDataName?: string;
    source?: LoadableArray<S>;
    preventSourceMemorize?: boolean;
    reloadSourceWhenOpen?: boolean;
    initFocusValue?: D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean;
    emptyItem?: boolean | string | { value: (D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean) | null | undefined; label: string; };
    tieInNames?: Array<{ dataName: string; hiddenName?: string }>;
  };

type SelectBoxProps<D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData> =
  OverwriteAttrs<HTMLAttributes<HTMLDivElement>, SelectBoxOptions<D, S>>;

export const SelectBox = <D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData>({
  labelDataName,
  valueDataName,
  source,
  preventSourceMemorize,
  reloadSourceWhenOpen,
  initFocusValue,
  emptyItem,
  tieInNames,
  ...props
}: SelectBoxProps<D, S>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const dialog = useDialog();

  const vdn = valueDataName ?? "value";
  const ldn = labelDataName ?? "label";

  const $emptyItem = (() => {
    if (emptyItem == null || emptyItem === false) return null;
    switch (typeof emptyItem) {
      case "boolean":
        return { [vdn]: undefined, [ldn]: "" };
      case "string":
        return { [vdn]: undefined, [ldn]: emptyItem || "" };
      default:
        return { [vdn]: emptyItem.value, [ldn]: emptyItem.label };
    }
  })();

  const $source = useMemo(() => {
    if (source) return source;
    if (props.dataItem) {
      if (props.dataItem.source) return props.dataItem.source;
      if ("trueValue" in props.dataItem) {
        return [
          { [vdn]: props.dataItem.trueValue, [ldn]: String(props.dataItem.trueValue) },
          { [vdn]: props.dataItem.falseValue, [ldn]: String(props.dataItem.falseValue) },
        ];
      }
    }
    return [];
  }, [preventSourceMemorize ? source : ""]);

  const [origin, loading, reload] = useLoadableArray($source, { preventMemorize: preventSourceMemorize });

  const fi = useFormItemCore<DataItem.$str | DataItem.$num | DataItem.$boolAny, D, string | number | boolean, { [P in typeof vdn]: string | number | boolean; } & { [P in typeof ldn]: any }>(props, {
    dataItemDeps: [vdn, ldn, origin],
    getDataItem: ({ dataItem }) => {
      return {
        type: dataItem?.type!,
        source: origin as DataItem.Source<any>,
      };
    },
    parse: ({ dataItem }) => {
      const parseData = ([v, r]: DataItem.ParseResult<any>) => {
        const item = origin.find(item => equals(item[vdn], v));
        return [item == null ? emptyItem : item, r] as DataItem.ParseResult<any>;
      };
      switch (dataItem.type) {
        case "bool":
        case "b-num":
        case "b-str":
          return p => parseData($boolParse(p as DataItem.ParseProps<DataItem.$boolAny>));
        case "str": return p => parseData($strParse(p as DataItem.ParseProps<DataItem.$str>));
        case "num": return p => parseData($numParse(p as DataItem.ParseProps<DataItem.$num>));
        default: return (p) => parseData([p.value]);
      }
    },
    effect: () => {

    },
    validation: ({ dataItem, iterator }) => {
      const funcs = (() => {
        switch (dataItem.type) {
          case "bool":
          case "b-num":
          case "b-str":
            return $boolValidations(dataItem as DataItem.$boolAny);
          case "str": return $strValidations(dataItem as DataItem.$str);
          case "num": return $numValidations(dataItem as DataItem.$num);
          default: return [
            ({ value, dataItem, fullName }) => {
              if (value != null && value !== "") return undefined;
              return { type: "e", code: "required", fullName, msg: `${dataItem.label || "値"}を選択してください。` };
            }
          ] as Array<DataItem.Validation<any>>;
        }
      })();
      return (v, p) => iterator(funcs, { ...p, value: v?.[vdn] });
    },
    focus: () => iref.current?.focus(),
  });

  const showDialog = () => {
    const anchor = iref.current?.parentElement;
    dialog.open({
      x: "inner",
      y: "outer",
      anchor,
      styles: {
        width: anchor?.offsetWidth,
      },
    });
  };

  const clear = () => {
    if (!fi.editable) return;
    fi.set({ value: $emptyItem?.[vdn], edit: false });
    setTimeout(() => iref.current?.focus(), 0);
  };

  const empty = fi.value == null || fi.value[vdn] == null || fi.value[vdn] === "";

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        className={joinClassNames("ipt-field", props.className)}
      >
        <input
          ref={iref}
          className="ipt-txt"
          type="text"
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          tabIndex={fi.tabIndex}
          autoComplete="off"
          aria-invalid={fi.airaProps["aria-invalid"]}
        />
        {!empty &&
          <input
            type="hidden"
            name={fi.name}
            value={String(fi.value[vdn])}
          />
        }
        {fi.editable &&
          <div
            className="ipt-btn ipt-pull"
            aria-disabled={fi.form.pending}
            onClick={showDialog}
            data-showed={dialog.state === "modal"}
          />
        }
        {!fi.hideClearButton && fi.editable &&
          <div
            className="ipt-btn"
            aria-disabled={fi.form.pending || empty}
            onClick={clear}
          >
            ×
          </div>
        }
        <Dialog
          hook={dialog.hook}
          className="ipt-dialog"
          customPosition
        >
          list
        </Dialog>
      </div>
      {fi.messageComponent}
    </>
  );
};
