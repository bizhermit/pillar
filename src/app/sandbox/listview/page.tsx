"use client";

import { ListViewColumn, listViewRowNumColumn } from "@/dom/elements/list-view";
import { listViewButtonColumn } from "@/dom/elements/list-view/button-column";
import { listViewImageColumn } from "@/dom/elements/list-view/image-column";
import { listViewLinkColumn } from "@/dom/elements/list-view/link-column";
import { useLang } from "@/i18n/react-hook";
import { generateArray } from "@/objects/array";
import { Button } from "@/react/elements/button";
import { useFormItemRef } from "@/react/elements/form/item-ref";
import { SelectBox } from "@/react/elements/form/items/select-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
import Link from "@/react/elements/link";
import { ListGrid, ListGridColumn, listGridRowNumColumn } from "@/react/elements/list/grid";
import { listGridButtonColumn } from "@/react/elements/list/grid-button-column";
import { listGridImageColumn } from "@/react/elements/list/grid-image-column";
import { listGridLinkColumn } from "@/react/elements/list/grid-link-column";
import { useListSortedValue } from "@/react/elements/list/hooks";
import { ListView } from "@/react/elements/list/view";
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
};

type ListType = "view" | "grid";

const Page = () => {
  const lang = useLang();
  const paging = useFormItemRef<boolean>();
  const listType = useFormItemRef<ListType, { value: ListType; label: string; }>();
  const scroll = useFormItemRef<boolean>();

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
  const { value: sortedValue, sortOrder, setSortOrder } = useListSortedValue(value);
  const list = usePagingArray({
    value: sortedValue,
    limit: 10,
  });

  const listViewColumns = useMemo<Array<ListViewColumn<Data>>>(() => {
    return [
      listViewRowNumColumn(),
      listViewLinkColumn({
        name: "link",
        target: "_blank",
        width: 60,
        link: ({ rowValue }) => {
          const idStr = String(rowValue.id).padStart(4, "0");
          return {
            href: rowValue.id === 3 ? null : `https://zukan.pokemon.co.jp/detail/${idStr}`,
            text: idStr,
            disabled: rowValue.id === 9,
          };
        },
      }),
      listViewLinkColumn({
        name: "btn-link",
        role: "button",
        link: ({ rowValue }) => {
          const idStr = String(rowValue.id).padStart(4, "0");
          return {
            href: rowValue.id === 6 ? null : `https://zukan.pokemon.co.jp/detail/${idStr}`,
            text: idStr,
            disabled: rowValue.id === 12,
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
        button: ({ rowValue }) => {
          return {
            disabled: rowValue.id === 1,
            hide: rowValue.id === 2,
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

  const listGridColumns = useMemo<Array<ListGridColumn<Data>>>(() => {
    return [
      listGridRowNumColumn(),
      listGridLinkColumn({
        width: 60,
        target: "_blank",
        link: ({ rowValue }) => {
          const idStr = String(rowValue.id).padStart(4, "0");
          return {
            href: rowValue.id === 3 ? null : `https://zukan.pokemon.co.jp/detail/${idStr}`,
            text: idStr,
            disabled: rowValue.id === 9,
          };
        },
      }),
      {
        name: "btn-link",
        align: "center",
        resize: false,
        cell: ({ rowValue }) => {
          if (rowValue.id === 6) return null;
          const idStr = String(rowValue.id).padStart(4, "0");
          return (
            <Link
              href={`https://zukan.pokemon.co.jp/detail/${idStr}`}
              target="_blank"
              button
              disabled={rowValue.id === 12}
            >
              {idStr}
            </Link>
          );
        },
      },
      listGridButtonColumn({
        text: lang("common.detail"),
        button: ({ rowValue }) => {
          return {
            color: "subdued",
            disabled: rowValue.id === 1,
            hide: rowValue.id === 2,
          };
        },
        onClick: (args) => {
          console.log(args);
        },
      }),
      listGridImageColumn({
        sticky: true,
        altName: "id",
        image: ({ rowValue }) => {
          return {
            src: rowValue.img,
          };
        },
      }),
      { name: "col1", header: "Col1", sort: true },
      { name: "col2", header: "Col2", sticky: true, sort: true },
      { name: "col3", header: "Col3", resetResize: count, sort: true },
      { name: "col4", header: "Col4", resize: count % 2 === 1 },
      { name: "col5", header: "Col5" },
      { name: "col6", header: "Col6" },
      { name: "col7", header: "Col7" },
      { name: "col8", header: "Col8" },
      { name: "col9", header: "Col9", fill: true },
    ];
  }, [count]);

  const listValue = paging.value ? list.value : sortedValue;

  return (
    <>
      <h1>ListView</h1>
      <div className={css.row}>
        <SelectBox
          ref={listType}
          style={{ width: 100 }}
          hideClearButton
          source={[
            { value: "view", label: "View" },
            { value: "grid", label: "Grid" },
          ]}
          defaultValue="grid"
        />
        <ToggleSwitch ref={paging}>
          Paging
        </ToggleSwitch>
        <ToggleSwitch
          ref={scroll}
          disabled={listType.value?.value === "view"}
        >
          Wrap Scroll
        </ToggleSwitch>
        <Button
          onClick={() => {
            setCount(c => c + 1);
          }}
        >
          col memorize dep: {count}
        </Button>
      </div>
      <div className={css.row}>
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
      <div
        className={css.main}
        data-scroll={listType.value?.value === "view" ? "no" : scroll.value}
      >
        {listType.value?.value === "view" ?
          <ListView
            className={css.listview}
            columns={listViewColumns}
            value={listValue}
            sortOrder={sortOrder}
            onClickSort={setSortOrder}
          />
          :
          <ListGrid
            className={css.listview}
            columns={listGridColumns}
            value={listValue}
            sortOrder={sortOrder}
            onClickSort={(p) => {
              console.log(p);
              setSortOrder(p);
            }}
          />
        }
      </div>
      {paging.value && list.showPagination &&
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
