"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { releaseCursor, setCursor } from "../../../dom/cursor";
import { useLang } from "../../../i18n/react-hook";
import { equals } from "../../../objects";
import { get } from "../../../objects/struct";
import useRender from "../../../react/hooks/render";
import "../../../styles/elements/list.scss";
import { throttle } from "../../../utilities/throttle";
import { joinClassNames } from "../utilities";

type Node = ReactNode | null | undefined;

type RenderParams<D extends ListData> = {
  name: string;
  value: Array<D> | null | undefined;
};

export type ListGridColumn<D extends ListData> = ListColumn<D> & {
  header?: Node | ((params: RenderParams<D>) => Node);
  footer?: Node | ((params: RenderParams<D>) => Node);
  cell?: Node | ((params: Omit<RenderParams<D>, "value"> & { index: number; rowValue: D; value: Array<D> }) => Node);
};

type ListGridColumnImpl<D extends ListData> = ListGridColumn<D> & {
  _width?: string;
  _stickyLeft?: string;
};

type ListGridOptions<D extends ListData> = ListOptions<D> & {
  idName?: string;
  columns: Array<ListGridColumn<D>>;
  value: Array<D> | null | undefined;
  sortOrder?: ListSortOrder;
  onClickSort?: ListSortClickEvent;
};

type ListGridProps<D extends ListData> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, ListGridOptions<D>>;

export const LIST_GRID_DEFAULT_CELL_WIDTH = 80;
export const LIST_GRID_DEFAULT_ROW_HEIGHT = 40;
const SCROLL_X_THROTTLE_TIMEOUT = 0;
const COL_RESIZE_THROTTLE_TIMEOUT = 20;

const parseStrNum = (w: number | string) => typeof w === "string" ? w : `${w}px`;

export const ListGrid = <D extends ListData>({
  className,
  style,
  idName: _idName,
  columns: _columns,
  value,
  sortOrder,
  onClickSort,
  cellWidth: _cellWidth,
  rowHeight: _rowHeight,
  ...props
}: ListGridProps<D>) => {
  const lang = useLang();
  const idName = _idName || "id";
  const defaultCellWidth = _cellWidth || LIST_GRID_DEFAULT_CELL_WIDTH;
  const defaultRowHeight = _rowHeight || LIST_GRID_DEFAULT_ROW_HEIGHT;
  const render = useRender();

  const ref = useRef<HTMLDivElement>(null!);
  const href = useRef<HTMLDivElement | null>(null);
  const bref = useRef<HTMLDivElement>(null!);
  const fref = useRef<HTMLDivElement>(null!);

  const columns = useRef<Array<ListGridColumnImpl<D>>>([]);
  const {
    hasHeader,
    hasFooter,
  } = useMemo(() => {
    let left = "";
    columns.current = _columns.map(c => {
      const col = columns.current.find(col => col.name === c.name);
      const w = col?._width;
      const inheritWidth = c.resize !== false && col && w != null && equals(col.resetResize, c.resetResize);
      const _width = inheritWidth ? w : undefined;
      let _stickyLeft: string | undefined;
      if (c.sticky) {
        const sw = parseStrNum(_width || c.width || defaultCellWidth);
        if (left) {
          _stickyLeft = left.indexOf("+") > 0 ? `calc(${left})` : left;
          left += ` + ${sw}`;
        } else {
          left = sw;
        }
      }
      return {
        ...c,
        _width,
        _stickyLeft,
      };
    });
    return {
      hasHeader: columns.current.find(c => "header" in c),
      hasFooter: columns.current.find(c => "footer" in c),
    }
  }, [_columns]);

  const calcScrollBarWidth = () => {
    const bodyWrapElem = bref.current.parentElement as HTMLDivElement;
    const w = bodyWrapElem.offsetWidth - bodyWrapElem.clientWidth;
    if (href.current) href.current.style.paddingRight = `${w}px`;
    fref.current.style.paddingRight = `${w}px`;
  };

  useEffect(() => {
    calcScrollBarWidth();
  }, [value]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calcScrollBarWidth();
    });
    observer.observe(ref.current);
    calcScrollBarWidth();
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      {...props}
      ref={ref}
      style={{
        ...style,
        "--row-height": parseStrNum(defaultRowHeight),
        "--cell-width": parseStrNum(defaultCellWidth),
      } as CSSProperties}
      className={joinClassNames("list-grid", className)}
    >
      {hasHeader &&
        <div
          ref={href}
          className="list-header"
          onScroll={throttle(() => {
            const sl = href.current!.scrollLeft;
            bref.current.scrollLeft = sl;
            fref.current.scrollLeft = sl;
          }, SCROLL_X_THROTTLE_TIMEOUT)}
        >
          <div className="list-row">
            {columns.current.map(col => {
              return (
                <ListGridHeaderCell
                  key={col.name}
                  column={col}
                  value={value}
                  sortOrder={sortOrder}
                  onClickSort={onClickSort}
                  onResize={(target) => {
                    render();
                    if (!target) calcScrollBarWidth();
                  }}
                />
              );
            })}
          </div>
        </div>
      }
      <div className="list-grid-body-wrap">
        {value?.length === 0 &&
          <div className="list-empty-msg" data-vis>
            {lang("common.noData")}
          </div>
        }
        <div
          ref={bref}
          className="list-body list-grid-body"
          onScroll={throttle(() => {
            const sl = bref.current.scrollLeft;
            if (href.current) href.current.scrollLeft = sl;
            fref.current.scrollLeft = sl;
          }, SCROLL_X_THROTTLE_TIMEOUT)}
        >
          {value?.map((v, i) => {
            const id = get(v, idName)[0];
            return (
              <div
                key={id}
                className="list-row"
                data-nth={i % 2 === 1 ? "odd" : "even"}
              >
                {columns.current.map(col => (
                  <ListGridCell
                    key={col.name}
                    column={col}
                    index={i}
                    rowValue={v}
                    value={value}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div
        ref={fref}
        className="list-footer"
        onScroll={throttle(() => {
          const sl = fref.current.scrollLeft;
          if (href.current) href.current.scrollLeft = sl;
          bref.current.scrollLeft = sl;
        }, SCROLL_X_THROTTLE_TIMEOUT)}
      >
        <div
          className="list-row"
          data-none={!hasFooter}
        >
          {columns.current.map(col => (
            <ListGridFooterCell
              key={col.name}
              column={col}
              value={value}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const parseCommonCellProps = <D extends ListData>(column: ListGridColumnImpl<D>): HTMLAttributes<HTMLDivElement> & { [v: `data-${string}`]: any } => {
  return {
    style: {
      width: column._width || column.width,
      minWidth: column.minWidth,
      maxWidth: column.maxWidth,
      left: column._stickyLeft || undefined,
    },
    "data-sticky": column.sticky ? "" : undefined,
    "data-fill": column.fill ? "" : undefined,
  };
};

type ListGridHeaderCellProps<D extends ListData> = {
  value: Array<D> | null | undefined;
  column: ListGridColumnImpl<D>;
  sortOrder: ListSortOrder | null | undefined;
  onClickSort: ListSortClickEvent | null | undefined;
  onResize: (target?: { name: string; width: number; }) => void;
};

const ListGridHeaderCell = <D extends ListData>({
  value,
  column,
  sortOrder,
  onClickSort,
  onResize,
}: ListGridHeaderCellProps<D>) => {
  const node = typeof column.header === "function" ? column.header({ name: column.name, value }) : column.header;

  return (
    <div
      className="list-cell"
      data-align={column.headerAlign || "center"}
      data-resize={column.resize !== false ? "" : undefined}
      data-sort={column.sort ? "" : undefined}
      {...parseCommonCellProps(column)}
      onClick={() => {
        if (!column.sort || !onClickSort) return;
        const cur = sortOrder?.find(o => o.name === column.name)?.direction || "none";
        const next = (() => {
          switch (cur) {
            case "asc":
              return "desc";
            case "desc":
              return "none";
            default:
              return "asc";
          }
        })();
        onClickSort({
          columnName: column.name,
          currentSortOrder: sortOrder,
          currentDirection: cur,
          nextDirection: next,
        });
      }}
    >
      {
        ["string", "number", "boolean"].includes(typeof node) ?
          <span className="list-span">{String(node)}</span> : node
      }
      {column.sort &&
        <div
          className="list-sort"
          {...(() => {
            const showOrderTitle = (sortOrder ?? []).filter(o => o.direction !== "none").length > 1;
            let orderIndex = 0;
            const order = sortOrder?.find(o => {
              if (o.direction !== "none") orderIndex++;
              return o.name === column.name;
            });
            return {
              "data-direction": order?.direction || "none",
              title: showOrderTitle ? ` ${orderIndex} ` : undefined,
            };
          })()}
        />
      }
      {column.resize !== false &&
        <div
          className="list-resizer"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={((e) => {
            const cellElem = e.currentTarget.parentElement!;
            const baseW = cellElem.offsetWidth;
            const baseX = e.clientX;
            setCursor(getComputedStyle(e.currentTarget as HTMLDivElement).cursor);
            const move = throttle((e: MouseEvent) => {
              const w = baseW + (e.clientX - baseX);
              column._width = parseStrNum(w);
              onResize({ name: column.name, width: w });
            }, COL_RESIZE_THROTTLE_TIMEOUT);
            const end = () => {
              releaseCursor();
              column._width = cellElem.style.width;
              onResize();
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", end);
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", end);
          })}
        >

        </div>
      }
    </div>
  );
};

type ListGridFooterCellProps<D extends ListData> = {
  value: Array<D> | null | undefined;
  column: ListGridColumnImpl<D>;
};

const ListGridFooterCell = <D extends ListData>({
  value,
  column,
}: ListGridFooterCellProps<D>) => {
  const node = typeof column.footer === "function" ? column.footer({ name: column.name, value }) : column.footer;

  return (
    <div
      className="list-cell"
      data-align={column.footerAlign}
      {...parseCommonCellProps(column)}
    >
      {
        ["string", "number", "boolean"].includes(typeof node) ?
          <span className="list-span">{String(node)}</span> : node
      }
    </div>
  );
};

type ListGridCellProps<D extends ListData> = {
  value: Array<D>;
  column: ListGridColumnImpl<D>;
  index: number;
  rowValue: D;
};

const ListGridCell = <D extends ListData>({
  value,
  column,
  index,
  rowValue,
}: ListGridCellProps<D>) => {
  const node = "cell" in column ?
    (typeof column.cell === "function" ?
      column.cell({ name: column.name, value, index, rowValue }) :
      column.cell
    ) :
    get(rowValue, column.name)[0];

  return (
    <div
      className="list-cell"
      data-align={column.align}
      {...parseCommonCellProps(column)}
    >
      {
        ["string", "number", "boolean"].includes(typeof node) ?
          <span className="list-span">{String(node)}</span> : node
      }
    </div>
  );
};

export const listGridRowNumColumn = <D extends ListData>(props?: Partial<Omit<ListGridColumn<D>, "cell">>): ListGridColumn<D> => {
  return {
    name: "_rownum",
    align: "center",
    sticky: true,
    width: 50,
    resize: false,
    ...props,
    cell: ({ index }) => index + 1,
  };
};
