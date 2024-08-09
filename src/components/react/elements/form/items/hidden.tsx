import { type HTMLAttributes, useEffect } from "react";
import { $arrayValidations } from "../../../../data-items/array/validation";
import { $boolValidations } from "../../../../data-items/bool/validation";
import { $dateValidations } from "../../../../data-items/date/validation";
import { $fileValidations } from "../../../../data-items/file/validation";
import { $numValidations } from "../../../../data-items/number/validation";
import { $strValidations } from "../../../../data-items/string/validation";
import { $structValidations } from "../../../../data-items/struct/validation";
import { $timeValidations } from "../../../../data-items/time/validation";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type HiddenOptions<V extends any, D extends DataItem.$object | undefined> = FormItemOptions<D, V> & {
  value?: V | null | undefined;
};

type HiddenProps<V extends any, D extends DataItem.$object | undefined> = OverwriteAttrs<HTMLAttributes<HTMLInputElement>, HiddenOptions<V, D>>;

export const Hidden = <V extends any, D extends DataItem.$object | undefined>({
  ...props
}: HiddenProps<V, D>) => {
  const fi = useFormItemCore<DataItem.$object, D, V, V>(props, {
    dataItemDeps: [],
    getDataItem: ({ dataItem, refs }) => {
      switch (dataItem?.type) {
        case "str":
          return {
            type: dataItem.type,
            length: dataItem.length,
            minLength: dataItem.minLength,
            maxLength: dataItem.maxLength,
            charType: dataItem.charType,
            source: dataItem.source,
          };
        case "num":
          return {
            type: dataItem.type,
            min: dataItem.min,
            max: dataItem.max,
            maxLength: dataItem.maxLength,
            float: dataItem.float,
            requiredIsNotZero: dataItem.requiredIsNotZero,
            source: dataItem.source,
          };
        case "bool":
        case "b-num":
        case "b-str":
          return {
            type: dataItem.type,
            trueValue: dataItem.trueValue,
            falseValue: dataItem.falseValue,
            requiredIsTrue: dataItem.requiredIsTrue,
            source: dataItem.source,
          };
        case "date":
        case "month":
          return {
            type: dataItem.type,
            min: dataItem.min,
            max: dataItem.max,
            pair: dataItem.pair,
            refs: dataItem.pair ? [dataItem.pair.name, ...(refs ?? [])] : refs,
          };
        case "time":
          return {
            type: dataItem.type,
            min: dataItem.min,
            max: dataItem.max,
            pair: dataItem.pair,
            refs: dataItem.pair ? [dataItem.pair.name, ...(refs ?? [])] : refs,
          };
        case "file":
          return {
            type: dataItem.type,
            accept: dataItem.accept,
            fileSize: dataItem.fileSize,
            fileName: dataItem.fileName,
          };
        default:
          return {
            type: dataItem?.type || "any",
          };
      }
    },
    parse: () => (p) => [p.value],
    effect: () => { },
    validation: ({ dataItem, iterator }) => {
      const funcs = (() => {
        switch (dataItem.type) {
          case "str": return $strValidations(dataItem as DataItem.$str);
          case "num": return $numValidations(dataItem as DataItem.$num);
          case "bool":
          case "b-num":
          case "b-str":
            return $boolValidations(dataItem as DataItem.$boolAny);
          case "date":
          case "month":
            return $dateValidations(dataItem as DataItem.$date);
          case "time": return $timeValidations(dataItem as DataItem.$time);
          case "file": return $fileValidations(dataItem as DataItem.$file);
          case "array": return $arrayValidations(dataItem as DataItem.$array<any>);
          case "struct": return $structValidations(dataItem as DataItem.$struct<Array<DataItem.$object>>);
          default:
            return (() => {
              const funcs: Array<DataItem.Validation<DataItem.$any, V>> = [];
              if (dataItem.required) {
                funcs.push((p) => {
                  if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
                  if (p.value != null && p.value !== "") return undefined;
                  return { type: "e", code: "required", fullName: p.fullName, msg: `${p.dataItem.label || "値"}を設定してください。` };
                });
              }
              if (dataItem.validations) funcs.push(...(dataItem as DataItem.$any).validations!);
              return funcs;
            })();
        }
      })();
      return (_, p) => iterator(funcs, p);
    },
    focus: () => { },
  });

  useEffect(() => {
    if ("value" in props) {
      fi.set({ value: props.value ?? props.defaultValue, effect: true, parse: true, edit: true });
    }
  }, [props.value]);

  const empty = fi.value == null || fi.value === "";

  return (
    <>
      <input
        {...fi.props}
        {...fi.attrs}
        className={joinClassNames("ipt-hidden", props.className)}
        type="hidden"
        name={fi.name}
        disabled={fi.disabled}
        readOnly={fi.readOnly}
        value={empty ? "" : String(fi.value)}
      />
      {fi.messageComponent}
    </>
  );
};
