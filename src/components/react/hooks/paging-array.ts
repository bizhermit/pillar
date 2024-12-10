"use client";

import { useEffect, useMemo, useState } from "react";
import { type PaginationOptions } from "../elements/pagination";

type Props<D extends any> = {
  value: Array<D> | null | undefined;
  limit: number;
  initPage?: number;
  disabled?: boolean;
};

export const usePagingArray = <D extends any = { [v: string | number]: any }>(props: Props<D>) => {
  const maxPage = Math.max(1, Math.ceil((props.value?.length ?? 0) / props.limit));
  const [page, setPage] = useState<number>(() => Math.min(maxPage, Math.max(1, props.initPage ?? 1)));
  const hasValue = props.value != null;
  const showPagination = hasValue && maxPage > 0;

  useEffect(() => {
    setPage(c => Math.min(maxPage, c));
  }, [maxPage]);

  const value = useMemo(() => {
    if (!hasValue) return props.value;
    return props.value!.slice(props.limit * (page - 1), props.limit * page);
  }, [page, props.limit, props.value]);

  return {
    originValue: props.value,
    value,
    length: props.value?.length,
    page,
    maxPage,
    limit: props.limit,
    hasValue,
    noData: (props.value?.length ?? 0) < 1,
    showPagination,
    setPage: (params: Parameters<Exclude<PaginationOptions["onChange"], null | undefined>>[0]) => {
      setPage(params.page);
    },
  };
};
