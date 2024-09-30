import { getObjectType } from "../objects";
import { get, set } from "../objects/struct";
import { $boolParse } from "./bool/parse";
import { $dateParse } from "./date/parse";
import { $datetimeParse } from "./datetime/parse";
import { $fileParse } from "./file/parse";
import { $numParse } from "./number/parse";
import { $strParse } from "./string/parse";
import { $timeParse } from "./time/parse";

export const parseBasedOnDataItem = (
  data: { [v: string]: any } | Array<any>,
  dataItems: Readonlyable<Array<DataItem.$object>>,
  env: DataItem.Env,
  parentName?: string
) => {
  const results: Array<DataItem.ValidationResult> = [];

  const hasError = () => results.some(r => r.type === "e");

  const getDataName = (dataItem: DataItem.$object, index?: number) => {
    return index == null ? dataItem.name : `${dataItem.name}.${index}`;
  };

  const replace = <D extends DataItem.$object>(dataItem: D, parse: (parseProps: DataItem.ParseProps<D>) => DataItem.ParseResult<any>, index: number | undefined): { value: (DataItem.ValueType<D> | null | undefined); name: string; } => {
    const name = getDataName(dataItem, index);
    const value = get(data, name)[0];
    const props = {
      value,
      data,
      dataItem,
      fullName: parentName ? `${parentName}.${name}` : name,
      env,
    } as const satisfies DataItem.ParseProps<D>;
    const [v, r] = parse(props);
    set(data, name, v);
    if (r) results.push(r);
    return { value: v, name };
  };

  const impl = (dataItem: DataItem.$object, index?: number) => {
    switch (dataItem.type) {
      case "str":
        replace(dataItem, p => $strParse(p), index);
        return;
      case "num":
        replace(dataItem, p => $numParse(p), index);
        return;
      case "bool":
      case "b-num":
      case "b-str":
        replace(dataItem, p => $boolParse(p), index);
        return;
      case "date":
      case "month":
        replace(dataItem, p => $dateParse(p), index);
        return;
      case "time":
        replace(dataItem, p => $timeParse(p), index);
        return;
      case "datetime":
        replace(dataItem, p => $datetimeParse(p), index);
        return;
      case "file":
        replace(dataItem, p => $fileParse(p), index);
        return;
      case "array": {
        const { value, name } = replace(dataItem, ({ value, fullName }) => {
          if (value == null || getObjectType(value) === "Array") return [value];
          return [undefined, { type: "e", code: "parse", fullName, msg: `${dataItem.label}に配列を設定してください。` }];
        }, index);
        if (!hasError() && value) {
          const item = dataItem.item;
          if (Array.isArray(item)) {
            results.push(...parseBasedOnDataItem(value, item, env, name));
          } else {
            switch (item.type) {
              case "struct":
                results.push(...parseBasedOnDataItem(value, item, env, name));
                break;
              default:
                value.forEach((_, i) => {
                  impl(dataItem, i);
                });
                break;
            }
          }
        }
        return;
      }
      case "struct": {
        const { value, name } = replace(dataItem, ({ value, fullName }) => {
          if (value == null || getObjectType(value) === "Object") return [value];
          return [undefined, { type: "e", code: "parse", fullName, msg: `${dataItem.label}に連想配列を設定してください。` }];
        }, index);
        if (!hasError() && value) results.push(...parseBasedOnDataItem(value, dataItem.item, env, name));
        return;
      }
      default:
        return;
    }
  };

  dataItems.forEach(dataItem => {
    impl(dataItem);
  });

  return results;
};
