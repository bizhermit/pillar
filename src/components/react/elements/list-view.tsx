"use client";

import { useEffect, useMemo, useRef, type HTMLAttributes } from "react";
import { ListViewClass, type ListViewColumn, type ListViewOptions } from "../../dom/elements/list-view";
import { useLang } from "../../i18n/react-hook";

type Data = { [v: string | number | symbol]: any };

type ListViewProps<D extends Data> = OverwriteAttrs<Omit<HTMLAttributes<HTMLDivElement>, "children">, {
  columns: Array<ListViewColumn<D>>;
  value: Array<D> | null | undefined;
  options?: ListViewOptions<D>;
}>;

export const ListView = <D extends Data>({
  columns,
  value,
  options,
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
      options,
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
