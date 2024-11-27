"use client";

import { ListViewColumn } from "@/dom/elements/list-view";
import { generateArray } from "@/objects/array";
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
  const [count, setCount] = useState(0);
  const [value, setValue] = useReducer((_: null | Array<Data>, action: number | null) => {
    if (action == null) return null;
    return generateArray(action, (i) => {
      return {
        id: i + 1,
        img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
        col1: `value-${i}`,
        col2: `value-abcdefghijklmnopqrstuvwxyz-${i * 9}`
      };
    });
  }, null);

  const columns = useMemo<Array<ListViewColumn<Data>>>(() => {
    return [
      {
        name: "id",
        sticky: true,
        align: "center",
        width: 40,
      },
      {
        name: "img",
        width: 40,
        sticky: true,
        align: "center",
        headerCell: "IMG",
        initializeCell: ({ cellElem }) => {
          const imgElem = document.createElement("img");
          imgElem.loading = "eager";
          imgElem.style.width = "30px";
          imgElem.style.height = "30px";
          cellElem.appendChild(imgElem);
          return {
            elems: [imgElem],
          };
        },
        cell: ({ rowData, column }) => {
          if (!rowData) return;
          const img = column.wElems[0] as HTMLImageElement;
          img.src = "";
          img.src = rowData.img;
          img.alt = `pokemon-${rowData.id}`;
        },
      },
      { name: "col1", headerCell: "Col1" },
      { name: "col2", headerCell: "Col2", sticky: true },
      { name: "col3", headerCell: "Col3" },
      { name: "col4", headerCell: "Col4" },
      { name: "col5", headerCell: "Col5" },
      { name: "col6", headerCell: "Col6" },
      { name: "col7", headerCell: "Col7" },
      { name: "col8", headerCell: "Col8" },
      { name: "col9", headerCell: "Col9" },
    ];
  }, []);

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
          value={value}
        />
      </div>
    </>
  );
};

export default Page;
