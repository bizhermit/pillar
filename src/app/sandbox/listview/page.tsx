"use client";

import { ListViewColumn, listViewRowNumColumn, ListViewSortClickEvent, ListViewSortOrder } from "@/dom/elements/list-view";
import { listViewButtonColumn } from "@/dom/elements/list-view/button-column";
import { listViewImageColumn } from "@/dom/elements/list-view/image-column";
import { listViewLinkColumn } from "@/dom/elements/list-view/link-column";
import { useLang } from "@/i18n/react-hook";
import { equals } from "@/objects";
import { generateArray } from "@/objects/array";
import { get } from "@/objects/struct";
import { Button } from "@/react/elements/button";
import { ListView } from "@/react/elements/list-view";
import { useMemo, useReducer, useState } from "react";
import css from "./page.module.scss";

type Data = {
  id: number;
  img: string;
  col1: string;
  col2?: string;
  col3?: string;
  col4?: string;
}

const Page = () => {
  const lang = useLang();
  const [count, setCount] = useState(0);
  const [value, setValue] = useReducer((_: null | Array<Data>, action: number | Array<Data> | null) => {
    if (action == null) return null;
    if (Array.isArray(action)) return action;
    const newValue = generateArray(action, (i) => {
      return {
        id: i + 1,
        img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
        col1: `value-${i}`,
        col2: `value-abcdefghijklmnopqrstuvwxyz-${i * 9}`
      };
    });
    return newValue;
  }, null);

  const [order, setOrder] = useReducer((state: ListViewSortOrder, action: Parameters<ListViewSortClickEvent>[0]) => {
    const newOrder = [...state];
    const i = newOrder.findIndex(o => o.name === action.columnName);
    if (i >= 0) newOrder.splice(i, 1);
    newOrder.push({ name: action.columnName, direction: action.nextDirection });
    return newOrder;
  }, []);

  const sortedValue = useMemo(() => {
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

  const columns = useMemo<Array<ListViewColumn<Data>>>(() => {
    return [
      listViewRowNumColumn(),
      listViewLinkColumn({
        name: "link",
        target: "_blank",
        width: 60,
        link: ({ rowData }) => {
          const idStr = String(rowData.id).padStart(4, "0");
          return {
            href: rowData.id === 3 ? null : `https://zukan.pokemon.co.jp/detail/${idStr}`,
            text: idStr,
            disabled: rowData.id === 9,
          };
        },
      }),
      listViewLinkColumn({
        name: "btn-link",
        role: "button",
        link: ({ rowData }) => {
          const idStr = String(rowData.id).padStart(4, "0");
          return {
            href: rowData.id === 6 ? null : `https://zukan.pokemon.co.jp/detail/${idStr}`,
            text: idStr,
            disabled: rowData.id === 12,
          };
        },
        interceptor: (href) => {
          // eslint-disable-next-line no-console
          console.log("intercept (use next router)", href);
        },
      }),
      listViewButtonColumn({
        name: "button",
        text: lang("common.detail"),
        button: ({ rowData }) => {
          return {
            disabled: rowData.id === 1,
            hide: rowData.id === 2,
          };
        },
        onClick: (params) => {
          // eslint-disable-next-line no-console
          console.log("click", params);
        },
      }),
      listViewImageColumn({
        name: "img",
        altName: "id",
        sticky: true,
      }),
      { name: "col1", headerCell: "Col1", sticky: true, sort: true },
      { name: "col2", headerCell: "Col2", sticky: true, sort: true },
      { name: "col3", headerCell: "Col3", resetResize: count, sort: true },
      { name: "col4", headerCell: "Col4", resize: count % 2 === 1 },
      { name: "col5", headerCell: "Col5" },
      { name: "col6", headerCell: "Col6" },
      { name: "col7", headerCell: "Col7" },
      { name: "col8", headerCell: "Col8" },
      { name: "col9", headerCell: "Col9", fill: true },
    ];
  }, [count]);

  return (
    <>
      <h1>ListView</h1>
      <div className={css.row}>
        <Button
          onClick={() => {
            setCount(c => c + 1);
          }}
        >
          state: {count}
        </Button>
        <Button onClick={() => setValue(null)}>clear</Button>
        <Button onClick={() => setValue(0)}>0</Button>
        <Button onClick={() => setValue(1)}>1</Button>
        <Button onClick={() => setValue(10)}>10</Button>
        <Button onClick={() => setValue(15)}>15</Button>
        <Button onClick={() => setValue(20)}>20</Button>
        <Button onClick={() => setValue(50)}>50</Button>
        <Button onClick={() => setValue(100)}>100</Button>
        <Button onClick={() => setValue(1000)}>1,000</Button>
        <Button onClick={() => setValue(10000)}>10,000</Button>
        <Button onClick={() => setValue(100000)}>100,000</Button>
        <Button onClick={() => setValue(1000000)}>1,000,000</Button>
      </div>
      <div className={css.main}>
        <ListView
          className={css.listview}
          columns={columns}
          value={sortedValue}
          sortOrder={order}
          onClickSort={(props) => {
            setOrder(props);
          }}
        />
      </div>
    </>
  );
};

export default Page;
