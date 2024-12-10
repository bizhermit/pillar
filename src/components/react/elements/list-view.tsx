"use client";

import { equals } from "@/objects";
import { get } from "@/objects/struct";
import { useEffect, useMemo, useReducer, useRef, type HTMLAttributes } from "react";
import { ListViewClass, type ListViewColumn, type ListViewOptions, type ListViewSortClickEvent, type ListViewSortOrder } from "../../dom/elements/list-view";
import { useLang } from "../../i18n/react-hook";

type Data = { [v: string | number | symbol]: any };

type ListViewProps<D extends Data> = OverwriteAttrs<Omit<HTMLAttributes<HTMLDivElement>, "children">, {
  columns: Array<ListViewColumn<D>>;
  value: Array<D> | null | undefined;
  sortOrder?: ListViewSortOrder;
  options?: ListViewOptions<D>;
  onClickSort?: ListViewSortClickEvent;
}>;

export const ListView = <D extends Data>({
  columns,
  value,
  sortOrder,
  options,
  onClickSort,
  ...props
}: ListViewProps<D>) => {
  const ref = useRef<HTMLDivElement>(null!);
  const lv = useRef<ListViewClass<D>>(null!);
  const lang = useLang();

  useEffect(() => {
    lv.current?.setOrder(sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    lv.current?.setColumns(columns);
  }, [columns]);

  useEffect(() => {
    lv.current?.setValue(value);
  }, [value]);

  useEffect(() => {
    lv.current = new ListViewClass<D>({
      root: ref.current,
      columns,
      value,
      sortOrder,
      options,
      onClickSort,
      lang,
    });

    return () => {
      lv.current.dispose();
    };
  }, []);

  if (lv.current) {
    lv.current.setOnSortClick(onClickSort);
  }

  return useMemo(() => (
    <div ref={ref} {...props} />
  ), []);
};

export const useListViewSortOrder = () => {
  return useReducer((state: ListViewSortOrder, action: Parameters<ListViewSortClickEvent>[0]) => {
    const newOrder = [...state];
    const i = newOrder.findIndex(o => o.name === action.columnName);
    if (i >= 0) newOrder.splice(i, 1);
    newOrder.push({ name: action.columnName, direction: action.nextDirection });
    return newOrder;
  }, []);
};

export const useListViewSortedMemorizedValue = <D extends Data>(value: Array<D> | null | undefined, order: ListViewSortOrder) => {
  return useMemo(() => {
    if (value == null || value.length === 0) return value;
    return [...value].sort((d1, d2) => {
      for (let i = 0, il = order.length; i < il; i++) {
        const { name, direction } = order[i];
        if (direction === "none") continue;
        const v1 = get(d1, name)[0];
        const v2 = get(d2, name)[0];
        if (equals(v1, v2)) continue;
        return (v1 < v2 ? -1 : 1) * (direction === "asc" ? 1 : -1);
      }
      return 0;
    });
  }, [value, order]);
};

export const useListViewSortedValue = <D extends Data>(value: Array<D> | null | undefined) => {
  const [sortOrder, setSortOrder] = useListViewSortOrder();
  const v = useListViewSortedMemorizedValue(value, sortOrder);
  return { value: v, sortOrder, setSortOrder } as const;
};
