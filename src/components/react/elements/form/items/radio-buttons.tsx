"use client";

import { type HTMLAttributes, useMemo, useRef } from "react";
import { $boolParse } from "../../../../data-items/bool/parse";
import { $boolValidations } from "../../../../data-items/bool/validation";
import { $numParse } from "../../../../data-items/number/parse";
import { $numValidations } from "../../../../data-items/number/validation";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { equals } from "../../../../objects";
import { set } from "../../../../objects/struct";
import "../../../../styles/elements/form/item.scss";
import { type LoadableArray, useLoadableArray } from "../../../hooks/loadable-array";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../item-core";

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
    parse: ({ dataItem, env, label }) => {
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
            msg: env.lang("validation.choices", { s: label, value: v }),
          }];
        }
        return [item, r];
      };
      switch (dataItem.type) {
        case "bool":
        case "b-num":
        case "b-str":
          return (p) => parseData($boolParse(p as DataItem.ParseProps<DataItem.$boolAny>), p);
        case "str": return (p, { bind }) => parseData($strParse(p as DataItem.ParseProps<DataItem.$str>, !bind), p);
        case "num": return (p, { bind }) => parseData($numParse(p as DataItem.ParseProps<DataItem.$num>, !bind), p);
        default: return (p) => parseData([p.value], p);
      }
    },
    revert: (v) => v?.[vdn],
    equals: (v1, v2) => equals(v1?.[vdn], v2?.[vdn]),
    effect: () => { },
    validation: ({ dataItem, env, iterator, label }) => {
      const funcs = (() => {
        switch (dataItem.type) {
          case "bool":
          case "b-num":
          case "b-str":
            return $boolValidations({ dataItem: dataItem as DataItem.$boolAny, env });
          case "str": return $strValidations({ dataItem: dataItem as DataItem.$str, env }, true);
          case "num": return $numValidations({ dataItem: dataItem as DataItem.$num, env }, true);
          default: return [
            ({ value, fullName }) => {
              if (value != null && value !== "") return undefined;
              return {
                type: "e",
                code: "required",
                fullName,
                msg: env.lang("validation.required", {
                  s: label,
                  mode: "select",
                }),
              };
            }
          ] as Array<DataItem.Validation<any>>;
        }
      })();
      return (v, p) => iterator(funcs, { ...p, value: v?.[vdn] });
    },
    setBind: ({ data, name, value }) => {
      if (name) set(data, name, value?.[vdn]);
      tieInNames?.forEach(({ dataName, hiddenName }) => {
        const v = value?.[dataName];
        set(data, hiddenName ?? dataName, v);
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
        className={joinClassNames("ipt-items", props.className)}
        ref={ref}
        data-name={fi.name}
        data-loaded={!loading}
      >
        {origin.map((item, i) => {
          const v = item[vdn];
          const s = item[sdn];
          const disabled = fi.disabled || s === "disabled";
          const readonly = fi.readOnly || loading || s === "readonly";
          return (
            <label
              className="ipt-lbl"
              key={v ?? "_null"}
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
                autoFocus={i === 0 && fi.autoFocus}
                checked={!empty && equals(v, fi.value[vdn])}
                {...fi.iptAria}
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
          <>
            <input
              name={fi.name}
              type="hidden"
              value={String(fi.value?.[vdn] ?? "")}
              disabled={fi.disabled}
            />
            {tieInNames?.map(({ dataName, hiddenName }) => {
              const v = fi.value?.[dataName];
              return (
                <input
                  key={dataName}
                  type="hidden"
                  name={hiddenName ?? dataName}
                  value={String(v ?? "")}
                />
              );
            })}
          </>
        }
      </div>
      {fi.messageComponent}
    </>
  );
};
