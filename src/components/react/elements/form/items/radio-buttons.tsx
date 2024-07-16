"use client";

import { type HTMLAttributes, useMemo, useRef } from "react";
import { $boolParse } from "../../../../data-items/bool/parse";
import { $boolValidations } from "../../../../data-items/bool/validation";
import { $numParse } from "../../../../data-items/number/parse";
import { $numValidations } from "../../../../data-items/number/validation";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { equals } from "../../../../objects";
import { setValue } from "../../../../objects/struct";
import { type LoadableArray, useLoadableArray } from "../../../hooks/loadable-array";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type SourceData = { [v: string]: any };
type SourceTempData<V = any> = { value: V; label: any; } & { [v: string]: any };

type RadioButtonsOptions<D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData = SourceTempData<D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean>> =
  Omit<FormItemOptions<D, D extends DataItem.$object ? DataItem.ValueType<D> : string | number | boolean, S>, "hideClearButton"> &
  {
    labelDataName?: string;
    valueDataName?: string;
    stateDataName?: string;
    source?: LoadableArray<S>;
    preventSourceMemorize?: boolean;
    tieInNames?: Array<{ dataName: string; hiddenName?: string }>;
    nullable?: "unselectable" | "allow" | "disallow";
  };

type RadioButtonsProps<D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData> =
  OverwriteAttrs<HTMLAttributes<HTMLDivElement>, RadioButtonsOptions<D, S>>;

export const RadioButtons = <D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData>({
  labelDataName,
  valueDataName,
  stateDataName,
  source,
  preventSourceMemorize,
  tieInNames,
  nullable,
  ...props
}: RadioButtonsProps<D, S>) => {
  const ref = useRef<HTMLDivElement>(null!);
  const vdn = valueDataName ?? "value";
  const ldn = labelDataName ?? "label";
  const sdn = stateDataName ?? "state";

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

  const [origin, loading] = useLoadableArray($source, { preventMemorize: preventSourceMemorize });

  const fi = useFormItemCore<DataItem.$str | DataItem.$num | DataItem.$boolAny, D, string | number | boolean, { [P in typeof vdn]: string | number | boolean; } & { [P in typeof ldn]: any }>(props, {
    dataItemDeps: [vdn, ldn, origin],
    getDataItem: ({ dataItem }) => {
      return {
        type: dataItem?.type!,
        source: origin as DataItem.Source<any>,
      };
    },
    parse: ({ dataItem }) => {
      const parseData = ([v, r]: DataItem.ParseResult<any>, p: DataItem.ParseProps<any>): DataItem.ParseResult<any> => {
        if (loading) {
          return [{ [vdn]: v, [ldn]: v == null ? "" : String(v) }, r];
        }
        if (v == null) return [undefined, r];
        const item = origin.find(item => equals(item[vdn], v));
        if (item == null) {
          return [undefined, {
            type: "e",
            code: "not-found",
            fullName: p.fullName,
            msg: `選択肢に値が存在しません。[${v}]`,
          }];
        }
        return [item, r];
      };
      switch (dataItem.type) {
        case "bool":
        case "b-num":
        case "b-str":
          return p => parseData($boolParse(p as DataItem.ParseProps<DataItem.$boolAny>), p);
        case "str": return p => parseData($strParse(p as DataItem.ParseProps<DataItem.$str>), p);
        case "num": return p => parseData($numParse(p as DataItem.ParseProps<DataItem.$num>), p);
        default: return (p) => parseData([p.value], p);
      }
    },
    revert: (v) => v?.[vdn],
    equals: (v1, v2) => equals(v1?.[vdn], v2?.[vdn]),
    effect: () => { },
    validation: ({ dataItem, iterator }) => {
      const funcs = (() => {
        switch (dataItem.type) {
          case "bool":
          case "b-num":
          case "b-str":
            return $boolValidations(dataItem as DataItem.$boolAny);
          case "str": return $strValidations(dataItem as DataItem.$str, true);
          case "num": return $numValidations(dataItem as DataItem.$num, true);
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
    setBind: ({ data, name, value }) => {
      setValue(data, name, value?.[vdn]);
      tieInNames?.forEach(({ dataName, hiddenName }) => {
        const v = value?.[dataName];
        setValue(data, hiddenName ?? dataName, v);
      });
    },
    focus: () => {
      ((ref.current?.querySelector(`label:has(input:checked:not([data-disabled="true"])`) ??
        ref.current?.querySelector(`label:has(input:not([data-disabled="true"])`)) as HTMLLabelElement)?.focus();
    },
  });

  const empty = fi.value == null || fi.value[vdn] == null || fi.value[vdn] === "";

  return (
    <>
      <div
        {...fi.props}
        {...fi.attrs}
        className={joinClassNames("ipt-radio-btns", props.className)}
        ref={ref}
      >
        {origin.map(item => {
          const v = item[vdn];
          const s = item[sdn];
          const disabled = fi.disabled || s === "disabled";
          const readonly = fi.readOnly || loading || s === "readonly";
          return (
            <label
              className="ipt-lbl"
              key={v}
              data-disabled={disabled}
              data-readonly={readonly}
              data-children={true}
            >
              <input
                className="ipt-radio"
                type="checkbox"
                disabled={disabled}
                readOnly={readonly}
                tabIndex={fi.tabIndex}
                checked={!empty && equals(item[vdn], fi.value[vdn])}
                data-invalid={fi.attrs["data-invalid"]}
                onChange={e => {
                  if (readonly || disabled || loading) return;
                  if (!e.target.checked && nullable === "unselectable") {
                    fi.set({ value: undefined, edit: true });
                    return;
                  }
                  fi.set({ value: item, edit: true });
                }}
              />
              {item[ldn]}
            </label>
          );
        })}
        {fi.name && fi.mountValue &&
          <input
            name={fi.name}
            type="hidden"
            value={String(fi.value?.[vdn] ?? "")}
            disabled={fi.disabled}
          />
        }
      </div>
      {fi.messageComponent}
    </>
  );
};
