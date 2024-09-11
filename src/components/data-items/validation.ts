import { get } from "../objects/struct";
import { $arrayValidations } from "./array/validation";
import { $boolValidations } from "./bool/validation";
import { $dateValidations } from "./date/validation";
import { $fileValidations } from "./file/validation";
import { $numValidations } from "./number/validation";
import { $strValidations } from "./string/validation";
import { $structValidations } from "./struct/validation";
import { $timeValidations } from "./time/validation";

export const validationBasedOnDataItem = (data: { [v: string]: any } | Array<any>, dataItems: Readonlyable<Array<DataItem.$object>>, parentName?: string) => {
  const results: Array<DataItem.ValidationResult> = [];

  const getDataName = (dataItem: DataItem.$object, index?: number) => {
    return index == null ? dataItem.name : `${dataItem.name}.${index}`;
  };

  const isValid = <D extends DataItem.$object>(dataItem: D, validations: Array<DataItem.Validation<any>>, index: number | undefined): { ok: boolean; value: DataItem.ValueType<D>; name: string; } => {
    const name = getDataName(dataItem, index);
    const value = get(data, name)[0];

    let r: DataItem.ValidationResult | null | undefined;
    for (const func of validations) {
      r = func({
        value,
        data,
        dataItem,
        siblings: dataItems,
        fullName: parentName ? `${parentName}.${name}` : name,
      });
      if (r) {
        results.push(r);
        return { ok: false, value, name };
      }
    }
    return { ok: true, value, name };
  };

  const impl = (dataItem: DataItem.$object, index?: number) => {
    switch (dataItem.type) {
      case "str":
        isValid(dataItem, $strValidations(dataItem), index);
        return;
      case "num":
        isValid(dataItem, $numValidations(dataItem), index);
        return;
      case "bool":
      case "b-num":
      case "b-str":
        isValid(dataItem, $boolValidations(dataItem), index);
        return;
      case "date":
      case "month":
        isValid(dataItem, $dateValidations(dataItem), index);
        return;
      case "time":
        isValid(dataItem, $timeValidations(dataItem), index);
        return;
      case "file":
        isValid(dataItem, $fileValidations(dataItem), index);
        return;
      case "array": {
        const { value, name } = isValid(dataItem, $arrayValidations(dataItem), index);
        if (value) {
          const item = dataItem.item;
          if (Array.isArray(item)) {
            results.push(...validationBasedOnDataItem(value, item, name));
          } else {
            switch (item.type) {
              case "struct":
                results.push(...validationBasedOnDataItem(value, item, name));
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
        const { value, name } = isValid(dataItem, $structValidations(dataItem), index);
        if (value) results.push(...validationBasedOnDataItem(value, dataItem.item, name));
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
