"use client";

import { useEffect, useMemo, useRef, type HTMLAttributes } from "react";
import { ListViewClass, type ListViewColumn } from "../../dom/elements/list-view";
import { useLang } from "../../i18n/react-hook";

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
  const lang = useLang();

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
      lang,
    });

    return () => {
      lv.current.dispose();
    };
  }, []);

  return useMemo(() => (
    <div ref={ref} {...props} />
  ), []);
};
