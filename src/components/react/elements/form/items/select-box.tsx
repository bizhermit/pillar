"use client";

import { type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { $boolParse } from "../../../../data-items/bool/parse";
import { $boolValidations } from "../../../../data-items/bool/validation";
import { $numParse } from "../../../../data-items/number/parse";
import { $numValidations } from "../../../../data-items/number/validation";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { equals } from "../../../../objects";
import { isEmpty } from "../../../../objects/string";
import { set } from "../../../../objects/struct";
import { type LoadableArray, useLoadableArray } from "../../../hooks/loadable-array";
import { Dialog, useDialog } from "../../dialog";
import { DownFillIcon } from "../../icon";
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
    placeholder?: string;
  };

type SelectBoxProps<D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData> =
  OverwriteAttrs<HTMLAttributes<HTMLDivElement>, SelectBoxOptions<D, S>>;

const listItemClassName = "ipt-list-item";

export const SelectBox = <D extends DataItem.$str | DataItem.$num | DataItem.$boolAny | undefined, S extends SourceData>({
  labelDataName,
  valueDataName,
  source,
  preventSourceMemorize,
  reloadSourceWhenOpen,
  initFocusValue,
  emptyItem,
  tieInNames,
  placeholder,
  ...props
}: SelectBoxProps<D, S>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const focusInput = () => iref.current?.focus();
  const dialog = useDialog(true);

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

  const clearFilter = () => {
    setFiltered(origin);
  };

  const filterItems = () => {
    const v = iref.current.value;
    if (isEmpty(v)) {
      clearFilter();
      return;
    }
    setFiltered(origin.filter(item => String(item[ldn] ?? "").indexOf(v) > -1));
  };

  const fi = useFormItemCore<DataItem.$str | DataItem.$num | DataItem.$boolAny, D, string | number | boolean, { [P in typeof vdn]: string | number | boolean; } & { [P in typeof ldn]: any }>(props, {
    dataItemDeps: [vdn, ldn, origin, ...(tieInNames ?? [])],
    getDataItem: ({ dataItem }) => {
      return {
        type: dataItem?.type!,
        source: origin as DataItem.Source<any>,
      };
    },
    getTieInNames: () => tieInNames?.map(item => item.hiddenName || item.dataName),
    parse: ({ dataItem }) => {
      const parseData = ([v, r]: DataItem.ParseResult<any>, p: DataItem.ParseProps<any>): DataItem.ParseResult<any> => {
        if (loading) {
          if (equals($emptyItem?.[vdn], v)) return [$emptyItem, r];
          return [{ [vdn]: v, [ldn]: v == null ? "" : String(v) }, r];
        }
        const item = origin.find(item => equals(item[vdn], v));
        if (item == null) {
          if (equals($emptyItem?.[vdn], v)) return [$emptyItem, r];
          return [$emptyItem, {
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
          return (p) => parseData($boolParse(p as DataItem.ParseProps<DataItem.$boolAny>), p);
        case "str": return (p, { bind }) => parseData($strParse(p as DataItem.ParseProps<DataItem.$str>, !bind), p);
        case "num": return (p, { bind }) => parseData($numParse(p as DataItem.ParseProps<DataItem.$num>, !bind), p);
        default: return (p) => parseData([p.value], p);
      }
    },
    revert: (v) => v?.[vdn],
    equals: (v1, v2) => equals(v1?.[vdn], v2?.[vdn]),
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
      if (name) set(data, name, value?.[vdn]);
      tieInNames?.forEach(({ dataName, hiddenName }) => {
        const v = value?.[dataName];
        set(data, hiddenName ?? dataName, v);
      });
    },
    focus: focusInput,
  });

  const empty = fi.value == null || fi.value[vdn] == null || fi.value[vdn] === "";

  const findSelectedOrFirstItemElem = () => {
    const pElem = iref.current.parentElement;
    if (!pElem) return;
    const elem = pElem.querySelector(`dialog .${listItemClassName}[data-selected="true"]`) ?? pElem.querySelector(`dialog .${listItemClassName}`);
    if (!elem) return;
    return elem as HTMLDivElement;
  };

  const focusSelected = (opts?: { preventFocus?: boolean; preventScroll?: boolean; }) => {
    const elem = findSelectedOrFirstItemElem();
    if (elem == null) return;
    if (!opts?.preventFocus) elem.focus();
    if (!opts?.preventScroll) elem.scrollIntoView({ block: "center" });
  };

  const showDialog = (opts?: {
    preventFocus?: boolean;
    preventScroll?: boolean;
    preventClearFilter?: boolean;
  }) => {
    if (!fi.editable || loading || dialog.showed) return;
    focusInput();
    if (!opts?.preventClearFilter) clearFilter();
    const anchorElem = iref.current?.parentElement;
    if (!anchorElem) return;
    if (reloadSourceWhenOpen) {
      if (typeof source === "function") {
        reload({
          callback: ({ ok }) => {
            if (ok) {
              focusSelected({
                preventFocus: opts?.preventFocus || iref.current === document.activeElement,
                preventScroll: opts?.preventScroll,
              });
            }
          },
        });
      }
    }
    dialog.open({
      anchor: {
        element: anchorElem,
        x: "inner",
        y: "outer",
        width: "fill",
      },
      callbackBeforeAnimation: () => {
        if (opts?.preventFocus) focusInput();
      },
      callback: () => {
        focusSelected({
          preventFocus: opts?.preventFocus,
          preventScroll: opts?.preventScroll,
        });
      },
    });
  };

  const closeDialog = (focus?: boolean) => {
    if (focus) focusInput();
    dialog.close({
      callback: clearFilter,
    });
  };

  const clickInput = () => {
    showDialog({ preventFocus: true });
  };

  const selectItemByText = (commit?: boolean) => {
    const text = iref.current.value;
    const item = origin.find(item => equals(item[ldn], text));
    if (item == null) {
      if (commit) {
        fi.set({ value: undefined, edit: true, effect: true });
        return;
      }
      iref.current.value = fi.value?.[ldn] || "";
      return;
    }
    fi.set({ value: item, edit: true, effect: true });
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
    selectItemByText();
    props.onBlur?.(e);
  };

  const keydown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "F2":
        showDialog({ preventFocus: true });
        break;
      case "Enter":
        closeDialog();
        selectItemByText(true);
        break;
      case "Escape":
        closeDialog();
        break;
      case "ArrowDown":
        if (!loading) {
          if (!dialog.showed) {
            showDialog({ preventClearFilter: true });
          } else {
            focusSelected();
            e.preventDefault();
          }
        }
        break;
      default:
        break;
    }
  };

  const change = () => {
    filterItems();
    if (!dialog.showed) {
      showDialog({ preventClearFilter: true, preventFocus: true });
    }
  };

  const clickPull = () => {
    showDialog();
  };

  const clear = () => {
    if (!fi.editable || loading || empty) return;
    fi.set({ value: $emptyItem?.[vdn], edit: true, effect: true, parse: true });
    focusInput();
    if (!dialog.showed) closeDialog();
  };

  useEffect(() => {
    clearFilter();
  }, [origin]);

  useEffect(() => {
    focusSelected({ preventFocus: true });
  }, [filtered]);

  return (
    <>
      <div
        {...fi.props}
        {...fi.attrs}
        data-readonly={fi.attrs["data-readonly"] || loading}
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
      >
        <input
          ref={iref}
          className="ipt-txt"
          type="text"
          placeholder={fi.editable ? placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || loading}
          tabIndex={fi.tabIndex}
          autoFocus={fi.autoFocus}
          autoComplete="off"
          data-invalid={fi.attrs["data-invalid"]}
          onClick={clickInput}
          onKeyDown={keydown}
          onChange={change}
        />
        {fi.mountValue &&
          <>
            <input
              type="hidden"
              name={fi.name}
              value={empty ? "" : fi.value[vdn]}
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
        {fi.showButtons &&
          <div
            className="ipt-btn ipt-pull"
            data-disabled={!fi.editable || loading}
            onClick={clickPull}
            tabIndex={-1}
            data-showed={dialog.showed}
          >
            <DownFillIcon />
          </div>
        }
        {fi.clearButton(empty || loading ? undefined : clear)}
        <Dialog
          modeless
          hook={dialog.hook}
          mobile
          className="ipt-dialog ipt-dialog-list"
        >
          <div className="ipt-mask" data-show={loading} />
          <div className="ipt-list">
            {$emptyItem &&
              <ListItem
                loading={loading}
                currentValue={fi.value?.[vdn]}
                empty={empty}
                initFocusValue={initFocusValue}
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
                loading={loading}
                key={item[vdn]}
                currentValue={fi.value?.[vdn]}
                empty={empty}
                initFocusValue={initFocusValue}
                value={item[vdn]}
                onSelect={() => {
                  if (!fi.editable || loading) return;
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
  initFocusValue: any;
  empty: boolean;
  loading: boolean;
  children: ReactNode;
};

const ListItem = ({
  onSelect,
  onEscape,
  value,
  currentValue,
  initFocusValue,
  empty,
  loading,
  children,
}: ListItemProps) => {
  const selected = (!empty && equals(value, currentValue)) || (empty ? equals(initFocusValue, value) : false);

  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "Enter":
        if (!loading) onSelect();
        break;
      case "Escape":
        onEscape();
        break;
      case "ArrowUp":
        if (!loading) {
          const prevElem = e.currentTarget.previousElementSibling as HTMLElement;
          if (prevElem) {
            prevElem.focus();
            prevElem.scrollIntoView({ block: "center" });
          }
        }
        break;
      case "ArrowDown":
        if (!loading) {
          const nextElem = e.currentTarget.nextElementSibling as HTMLElement;
          if (nextElem) {
            nextElem.focus();
            nextElem.scrollIntoView({ block: "center" });
          }
        }
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
