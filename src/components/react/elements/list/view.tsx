"use client";

import { useEffect, useMemo, useRef, type HTMLAttributes } from "react";
import { ListViewClass, type ListViewColumn, type ListViewOptions } from "../../../dom/elements/list-view";
import { useLang } from "../../../i18n/react-hook";

type ListViewProps<D extends ListData> = OverwriteAttrs<Omit<HTMLAttributes<HTMLDivElement>, "children">, {
  columns: Array<ListViewColumn<D>>;
  value: Array<D> | null | undefined;
  sortOrder?: ListSortOrder;
  options?: ListViewOptions<D>;
  onClickSort?: ListSortClickEvent;
}>;

export const ListView = <D extends ListData>({
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
