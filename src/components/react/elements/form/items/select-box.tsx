import { $boolParse } from "@/data-items/bool/parse";
import { $boolValidations } from "@/data-items/bool/validation";
import { $numParse } from "@/data-items/number/parse";
import { $numValidations } from "@/data-items/number/validation";
import { $strParse } from "@/data-items/string/parse";
import { $strValidations } from "@/data-items/string/validation";
import { LoadableArray } from "@/react/hooks/loadable-array";
import { HTMLAttributes, useRef } from "react";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type SourceData = { [v: string]: any };
type SourceTempData<V = any> = { value: V; label: any; } & { [v: string]: any };

type SelectBoxOptions<D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData = SourceTempData<D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean>> = FormItemOptions<D, D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean, S> &
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

  const vdn = valueDataName ?? "value";
  const ldn = labelDataName ?? "label";

  const fi = useFormItemCore<DataItem.$str | DataItem.$num | DataItem.$boolAny, D, string | number | boolean, { [P in typeof vdn]: string | number | boolean; } & { [P in typeof ldn]: any }>(props, {
    dataItemDeps: [],
    getDataItem: ({ dataItem }) => {
      if (dataItem) {
        return {
          type: dataItem.type,
          source: dataItem.source ?? (() => {
            if ("trueValue" in dataItem) {
              return [
                { value: dataItem.trueValue, label: String(dataItem.trueValue) },
                { value: dataItem.falseValue, label: String(dataItem.falseValue) },
              ];
            }
            return undefined;
          })(),
        };
      }
      return {
        type: null!,
      };
    },
    parse: ({ dataItem }) => {
      const parseData = ([v, r]: DataItem.ParseResult<any>) => {
        // TODO:
        return [{
          [vdn]: v,
          [ldn]: String(v),
        }, r] as DataItem.ParseResult<any>;
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
      </div>
      {fi.messageComponent}
    </>
  );
};
