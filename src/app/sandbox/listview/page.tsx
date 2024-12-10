"use client";

import { ListViewColumn, listViewRowNumColumn } from "@/dom/elements/list-view";
import { listViewButtonColumn } from "@/dom/elements/list-view/button-column";
import { listViewImageColumn } from "@/dom/elements/list-view/image-column";
import { listViewLinkColumn } from "@/dom/elements/list-view/link-column";
import { useLang } from "@/i18n/react-hook";
import { generateArray } from "@/objects/array";
import { Button } from "@/react/elements/button";
import { ListView } from "@/react/elements/list-view";
import { useListViewSortedValue } from "@/react/elements/list-view/hooks";
import { Pagination } from "@/react/elements/pagination";
import { usePagingArray } from "@/react/hooks/paging-array";
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

  // const [order, setOrder] = useListViewSortOrder();
  // const sortedValue = useListViewSortedMemorizedValue(value, order);
  const { value: sortedValue, sortOrder, setSortOrder } = useListViewSortedValue(value);
  const list = usePagingArray({
    value: sortedValue,
    limit: 10,
  });

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
        <Button onClick={() => setValue(11)}>11</Button>
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
          value={list.value}
          sortOrder={sortOrder}
          onClickSort={(props) => {
            setSortOrder(props);
          }}
        />
      </div>
      {list.showPagination &&
        <Pagination
          page={list.page}
          maxPage={list.maxPage}
          onChange={list.setPage}
        />
      }
    </>
  );
};

export default Page;
