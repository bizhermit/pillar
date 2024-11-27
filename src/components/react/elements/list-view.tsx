"use client";

import { useEffect, useMemo, useRef, type HTMLAttributes } from "react";
import { ListViewClass, ListViewColumn } from "../../dom/elements/list-view";

type Data = { [v: string | number | symbol]: any };

type ListViewOptions<D extends Data> = {
  columns: Array<ListViewColumn<D>>;
  value: Array<D> | null | undefined;
};

type ListViewProps<D extends Data> = OverwriteAttrs<Omit<HTMLAttributes<HTMLDivElement>, "children">, ListViewOptions<D>>;

export const ListView = <D extends Data>({
  columns,
  value,
  ...props
}: ListViewProps<D>) => {
  const ref = useRef<HTMLDivElement>(null!);
  const lv = useRef<ListViewClass<D>>(null!);

  useEffect(() => {
    lv.current?.setValue(value);
  }, [value]);

  useEffect(() => {
    lv.current = new ListViewClass<D>({
      root: ref.current,
      columns,
      value,
    });

    return () => {
      lv.current.dispose();
    };
  }, []);

  return useMemo(() => (
    <div ref={ref} {...props} />
  ), []);
};
