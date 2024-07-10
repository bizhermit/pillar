import { $boolParse } from "@/data-items/bool/parse";
import { $boolValidations } from "@/data-items/bool/validation";
import { $numParse } from "@/data-items/number/parse";
import { $numValidations } from "@/data-items/number/validation";
import { $strParse } from "@/data-items/string/parse";
import { $strValidations } from "@/data-items/string/validation";
import { equals } from "@/objects";
import { type LoadableArray, useLoadableArray } from "@/react/hooks/loadable-array";
import { FocusEvent, type HTMLAttributes, KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
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

const listItemClassName = "ipt-dialog-list-item";

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
  const [filtered, setFiltered] = useState(origin);

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
    effect: ({ value }) => {
      iref.current.value = value?.[ldn] || "";
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

  const focusSelected = () => {
    const pElem = iref.current.parentElement;
    if (!pElem) return;
    const itemElem = (pElem.querySelector(`dialog .${listItemClassName}[data-selected="true"]`) ?? pElem.querySelector(`dialog .${listItemClassName}`)) as HTMLElement;
    if (!itemElem) return;
    itemElem.focus();
    itemElem.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const showDialog = () => {
    if (!fi.editable || loading) return;
    const anchorElem = iref.current?.parentElement;
    if (!anchorElem) return;
    dialog.open({
      modal: false,
      anchor: {
        element: anchorElem,
        x: "inner",
        y: "outer",
        width: "fill",
      },
      callback: focusSelected,
    });
  };

  const closeDialog = (focus?: boolean) => {
    if (focus) iref.current?.focus();
    dialog.close();
  };

  const focus = () => {
    showDialog();
  };

  const blur = (e: FocusEvent<HTMLDivElement>) => {
    let elem = e.relatedTarget;
    while (elem) {
      if (elem === e.currentTarget) return;
      elem = elem.parentElement;
    }
    closeDialog();
    iref.current.value = fi.value?.[ldn] || "";
  };

  const keydown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "F2":
        showDialog();
        break;
      case "Escape":
        closeDialog();
        break;
      case "ArrowDown":
        showDialog();
        break;
      default:
        break;
    }
  };

  const empty = fi.value == null || fi.value[vdn] == null || fi.value[vdn] === "";

  const clear = () => {
    if (!fi.editable || loading || empty) return;
    fi.set({ value: $emptyItem?.[vdn], edit: false });
    iref.current?.focus();
    if (dialog.state === "closed") closeDialog();
  };

  useEffect(() => {
    setFiltered(origin);
  }, [origin]);

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        aria-readonly={fi.airaProps["aria-readonly"] || loading}
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
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
          onFocus={focus}
          onKeyDown={keydown}
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
            aria-disabled={fi.form.pending || loading}
            onClick={showDialog}
            tabIndex={-1}
            data-showed={dialog.state === "modal"}
          />
        }
        {!fi.hideClearButton && fi.editable &&
          <div
            className="ipt-btn"
            aria-disabled={fi.form.pending || empty || loading}
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
          <div className="ipt-dialog-list">
            {$emptyItem &&
              <ListItem
                currentValue={fi.value?.[vdn]}
                empty={empty}
                value={$emptyItem?.[vdn]}
                onSelect={() => {
                  fi.set({ value: $emptyItem, edit: true });
                  closeDialog(true);
                }}
                onEscape={() => {
                  closeDialog(true);
                }}
              >
                {$emptyItem?.[ldn]}
              </ListItem>
            }
            {filtered.map(item => (
              <ListItem
                key={item[vdn]}
                currentValue={fi.value?.[vdn]}
                empty={empty}
                value={item[vdn]}
                onSelect={() => {
                  fi.set({ value: item, edit: true });
                  closeDialog(true);
                }}
                onEscape={() => {
                  closeDialog(true);
                }}
              >
                {item[ldn]}
              </ListItem>
            ))}
          </div>
        </Dialog>
      </div>
      {fi.messageComponent}
    </>
  );
};

type ListItemProps = {
  onSelect: () => void;
  onEscape: () => void;
  value: any;
  currentValue: any;
  empty: boolean;
  children: ReactNode;
}

const ListItem = ({
  onSelect,
  onEscape,
  value,
  currentValue,
  empty,
  children,
}: ListItemProps) => {
  const selected = !empty && equals(value, currentValue);

  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "Enter":
        onSelect();
        break;
      case "Escape":
        onEscape();
        break;
      case "ArrowUp":
        (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
        e.currentTarget.scrollIntoView({
          block: "center",
        });
        break;
      case "ArrowDown":
        (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
        e.currentTarget.scrollIntoView({
          block: "center",
        });
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={listItemClassName}
      tabIndex={-1}
      autoFocus={selected}
      data-selected={selected}
      onClick={onSelect}
      onKeyDown={keydown}
    >
      {children}
    </div>
  );
};
