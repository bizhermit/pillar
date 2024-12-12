"use client";

import { useMemo, useReducer } from "react";
import { equals } from "../../../objects";
import { get } from "../../../objects/struct";

type Data = { [v: string | number | symbol]: any };

export const useListSortOrder = () => {
  return useReducer((state: ListSortOrder, action: Parameters<ListSortClickEvent>[0]) => {
    const newOrder = [...state];
    const i = newOrder.findIndex(o => o.name === action.columnName);
    if (i >= 0) newOrder.splice(i, 1);
    newOrder.push({ name: action.columnName, direction: action.nextDirection });
    return newOrder;
  }, []);
};

export const useListSortedMemorizedValue = <D extends Data>(value: Array<D> | null | undefined, order: ListSortOrder) => {
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

export const useListSortedValue = <D extends Data>(value: Array<D> | null | undefined) => {
  const [sortOrder, setSortOrder] = useListSortOrder();
  const v = useListSortedMemorizedValue(value, sortOrder);
  return { value: v, sortOrder, setSortOrder } as const;
};
