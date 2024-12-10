"use client";

import { throttle } from "@/utilities/throttle";
import { equals } from "../../../objects";
import { get } from "../../../objects/struct";
import "../../../styles/elements/list-view.scss";
import { releaseCursor, setCursor } from "../../cursor";
import { cloneDomElement, DomElement } from "../../element";

type Data = { [v: string | number | symbol]: any };
type Node = string | null | undefined;

type ListViewCol<D extends Data> = {
  column: ListViewColumnImpl<D>;
  elem: DomElement<HTMLDivElement>;
  wElems: Array<HTMLElement>;
  resizedWidth?: string;
};
type ListViewDataRow<D extends Data> = {
  dom: DomElement<HTMLDivElement>;
  cols: Array<ListViewCol<D>>;
  data: D | null | undefined;
};

type ListViewHeaderRow<D extends Data> = {
  dom: DomElement<HTMLDivElement>;
  cols: Array<ListViewCol<D>>;
};

type ListViewFooterRow<D extends Data> = {
  dom: DomElement<HTMLDivElement>;
  cols: Array<ListViewCol<D>>;
};

type RenderParams<D extends Data> = ListViewCol<D> & {
  arrayData: Array<D> | null | undefined;
};

type InitializeCellParams<D extends Data> = {
  column: ListViewColumn<D>;
  cell: DomElement<HTMLDivElement>;
  getArrayData: () => (Array<D> | null | undefined);
};
type InitializeCellResponse<CellElems extends Array<HTMLElement>> = {
  elems: CellElems;
};

type ListViewCellAlign = "left" | "center" | "right";

export type ListViewColumn<
  D extends Data,
  CellElems extends Array<HTMLElement> = Array<HTMLElement>,
  HCellElems extends Array<HTMLElement> = Array<HTMLElement>,
  FCellElems extends Array<HTMLElement> = Array<HTMLElement>,
> = {
  name: string;
  initializeHeaderCell?: (params: InitializeCellParams<D>) => (InitializeCellResponse<HCellElems> | void);
  headerCell?: Node | ((params: RenderParams<D>) => void);
  headerAlign?: ListViewCellAlign;
  initializeFooterCell?: (params: InitializeCellParams<D>) => (InitializeCellResponse<FCellElems> | void);
  footerCell?: Node | ((params: RenderParams<D>) => void);
  footerAlign?: ListViewCellAlign;
  initializeCell?: (params: InitializeCellParams<D>) => (InitializeCellResponse<CellElems> | void);
  cell?: Node | ((params: RenderParams<D> & { index: number; rowData: D | null | undefined; }) => void);
  align?: ListViewCellAlign;
  sticky?: boolean;
  fill?: boolean;
  resize?: boolean;
  resetResize?: any;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  sort?: boolean;
};

type ListViewColumnImpl<D extends Data> = ListViewColumn<D> & {
  _width?: string; // NOTE: headerのみ
  _sortElem?: HTMLDivElement; // NOTE: headerのみ
};

type SortDirection = "asc" | "desc" | "none";

export type ListViewSortOrder = Array<{
  name: string;
  direction: SortDirection;
}>;

export type ListViewSortClickEvent = (props: {
  columnName: string;
  currentDirection: SortDirection;
  nextDirection: SortDirection;
  currentSortOrder: ListViewSortOrder | null | undefined;
}) => void;

export type ListViewOptions<D extends Data> = {
  rowHeight?: number;
  cellWidth?: number | string;
};

type ListViewProps<D extends Data> = {
  root: HTMLElement;
  value: Array<D> | null | undefined;
  columns: Array<ListViewColumn<D>>;
  sortOrder?: ListViewSortOrder;
  options?: ListViewOptions<D>;
  lang: LangAccessor;
  onClickSort?: ListViewSortClickEvent;
};

export const LIST_VIEW_DEFAULT_ROW_HEIGHT = 40;
export const LIST_VIEW_DEFAULT_CELL_WIDTH = 80;
const SCROLL_X_THROTTLE_TIMEOUT = 10;
const SCROLL_Y_THROTTLE_TIMEOUT = 10;
const COL_RESIZE_THROTTLE_TIMEOUT = 20;

const parseStrNum = (w: number | string) => typeof w === "string" ? w : `${w}px`;

export class ListViewClass<D extends Data> {

  protected lang: LangAccessor;
  protected root: DomElement<HTMLElement>;
  protected observer: ResizeObserver;

  protected cloneBase: {
    div: HTMLDivElement;
    span: HTMLSpanElement;
    row: DomElement<HTMLDivElement>;
    cell: DomElement<HTMLDivElement>;
  };
  protected header: DomElement<HTMLDivElement> | undefined;
  protected footer: DomElement<HTMLDivElement>;
  protected bodyWrap: DomElement<HTMLDivElement>;
  protected body: DomElement<HTMLDivElement>;
  protected dummy: HTMLDivElement;
  protected emptyMsg: DomElement<HTMLDivElement>;

  protected headerRow: ListViewHeaderRow<D> | undefined;
  protected footerRow: ListViewFooterRow<D> | undefined;
  protected rows: Array<ListViewDataRow<D>>;

  protected columns: Array<ListViewColumnImpl<D>>;
  protected value: Array<D> | null | undefined;
  protected sortOrder: ListViewSortOrder | null | undefined;

  protected firstIndex: number;
  protected rowHeight: number;
  protected cellWidth: number | string;

  protected onClickSort: ListViewSortClickEvent | null | undefined;

  constructor(props: ListViewProps<D>) {
    this.lang = props.lang;
    this.root = new DomElement(props.root);
    this.columns = props.columns;
    this.value = props.value;
    this.sortOrder = props.sortOrder;
    this.rows = [];

    this.root.elem.classList.add("lv-main");
    const div = document.createElement("div");
    this.cloneBase = {
      div,
      span: document.createElement("span"),
      row: cloneDomElement(div).addClass("lv-row").setAttr("data-none", ""),
      cell: cloneDomElement(div).addClass("lv-cell"),
    };
    this.bodyWrap = null!;
    this.body = null!;
    this.footer = null!;
    this.dummy = null!;
    this.emptyMsg = null!;

    this.firstIndex = 0;
    this.root.elem.style.setProperty("--row-height", `${this.rowHeight = props.options?.rowHeight ?? LIST_VIEW_DEFAULT_ROW_HEIGHT}px`);
    this.root.elem.style.setProperty("--cell-width", this.cellWidth = parseStrNum(props.options?.cellWidth ?? LIST_VIEW_DEFAULT_CELL_WIDTH));

    this.generateHeader();
    this.generateBody();
    this.generateFooter();

    this.observer = new ResizeObserver(() => {
      this.resize();
    });
    this.observer.observe(this.root.elem);
    this.onClickSort = props.onClickSort;

    this.render();
  }

  public dispose() {
    this.observer.disconnect();
    this.root.dispose();
    this.root.elem.textContent = "";
    return;
  }

  public setColumns(columns: Array<ListViewColumn<D>>) {
    this.columns = columns.map(c => {
      const col = this.columns.find(col => col.name === c.name);
      const w = col?._width;
      const inheritWidth = c.resize !== false && col && w != null && equals(col.resetResize, c.resetResize);
      return {
        ...c,
        _width: inheritWidth ? w : undefined,
      };
    });
    this.generateHeader();
    this.generateBody();
    this.generateFooter();
    this.render();
    this.scrollY();
    return this;
  }

  public setOrder(order: ListViewSortOrder | undefined) {
    this.sortOrder = order;
    this.renderSortOrder();
    return this;
  }

  public getValue() {
    return this.value;
  }

  public setValue(value: Array<D> | null | undefined) {
    const dif = this.value?.length !== value?.length;
    this.value = value;
    if (this.value?.length === 0) this.emptyMsg.setAttr("data-vis");
    else this.emptyMsg.rmAttr("data-vis");
    this.dummy.style.height = `${(this.value?.length ?? 0) * this.rowHeight}px`;
    this.calcScrollBarWidth();
    if (dif) this.body.elem.style.visibility = "hidden";
    this.scrollY();
    this.render();
    if (dif) this.body.elem.style.removeProperty("visibility");
    return this;
  }

  protected generateRowColsImpl(props: {
    dom: DomElement<HTMLDivElement>;
    align?: (column: ListViewColumn<D>) => (ListViewCellAlign | undefined);
    initialize?: (params: { column: ListViewColumnImpl<D>; cell: DomElement<HTMLDivElement>; }) => (InitializeCellResponse<Array<HTMLElement>> | void);
  }) {
    let left = "";
    return this.columns.map(c => {
      const cell = this.cloneBase.cell.clone();
      const align = props.align?.(c);
      if (align) cell.setAttr("data-align", align);
      if (c._width || c.width) cell.setStyleSize("width", c._width || c.width);
      if (c.minWidth) cell.setStyleSize("minWidth", c.minWidth);
      if (c.maxWidth) cell.setStyleSize("maxWidth", c.maxWidth);
      if (c.sticky) {
        cell.setAttr("data-sticky");
        const w = parseStrNum(c._width || c.width || this.cellWidth);
        if (left) {
          cell.elem.style.setProperty("left", left.indexOf("+") > 0 ? `calc(${left})` : left);
          left += ` + ${w}`;
        } else {
          left = w;
        }
      }
      if (c.fill) cell.setAttr("data-fill");
      props.dom.addChild(cell);
      return {
        column: c,
        elem: cell,
        wElems: (() => {
          const init = props.initialize?.({ column: c, cell });
          if (init) return init.elems;
          const sElem = this.cloneBase.span.cloneNode() as HTMLSpanElement;
          sElem.classList.add("lv-span");
          cell.elem.appendChild(sElem);
          return [sElem];
        })(),
      };
    });
  }

  protected generateHeader() {
    if (this.columns.find(c => c.headerCell != null)) {
      if (!this.header) {
        this.header = cloneDomElement(this.cloneBase.div)
          .addClass("lv-header")
          .addEvent("scroll", throttle(() => {
            this.scrollX("h");
          }, SCROLL_X_THROTTLE_TIMEOUT));
        this.root.addChild(this.header);
      }
      this.header.rmChild();
    } else {
      this.root.rmChild(this.header);
      this.header = undefined;
      this.headerRow = undefined;
    }
    if (!this.header) return;

    const dom = this.cloneBase.row.clone().rmAttr("data-none");
    const resizeDom = cloneDomElement(this.cloneBase.div);
    const cols = this.generateRowColsImpl({
      dom,
      align: c => c.align || "center",
      initialize: ({ column, cell }) => {
        if (column.resize !== false && !column.fill) {
          let resizeCtx: { x: number; w: number; cells: Array<DomElement<HTMLDivElement>>; } | null = null;
          const move = throttle((e: MouseEvent) => {
            if (!resizeCtx) return;
            const w = resizeCtx.w + (e.clientX - resizeCtx.x);
            resizeCtx.cells.forEach(cell => cell.setStyleSize("width", w));
            if (column.sticky) this.calcStickyPosition({ name: column.name, width: w });
          }, COL_RESIZE_THROTTLE_TIMEOUT);
          const end = () => {
            releaseCursor();
            column._width = resizeCtx?.cells[0].elem.style.width;
            resizeCtx = null;
            this.calcStickyPosition();
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", end);
          };
          const resizer = resizeDom.clone().addClass("lv-resizer").addEvent("mousedown", (e) => {
            resizeCtx = {
              w: cell.elem.offsetWidth,
              x: e.clientX,
              cells: [cell, ...this.rows.map(row => {
                return row.cols.find(c => c.column.name === column.name)?.elem;
              })].filter(c => c != null) as Array<DomElement<HTMLDivElement>>,
            };
            setCursor(getComputedStyle((e.currentTarget as HTMLDivElement)).cursor);
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", end);
          });
          if (column.sort) {
            resizer.addEvent("click", (e) => {
              e.stopPropagation();
            });
          }
          cell.addChild(resizer);
          cell.setAttr("data-resize");
        }
        if (column.sort) {
          const elem = this.cloneBase.div.cloneNode() as HTMLDivElement;
          elem.classList.add("lv-sort");
          column._sortElem = elem;
          cell.setAttr("data-sort").addEvent("click", () => {
            this.sortClick(column);
          }).elem.appendChild(elem);
        }
        return column.initializeHeaderCell?.({
          column,
          cell,
          getArrayData: () => this.value,
        });
      },
    });
    this.headerRow = { dom, cols };
    this.header.addChild(dom);
  }

  protected generateBody() {
    if (!this.bodyWrap) {
      this.bodyWrap = cloneDomElement(this.cloneBase.div)
        .addClass("lv-body-wrap")
        .addEvent("scroll", throttle(() => {
          this.scrollY();
        }, SCROLL_Y_THROTTLE_TIMEOUT));
      this.dummy = this.cloneBase.div.cloneNode() as HTMLDivElement;
      this.dummy.classList.add("lv-dummy");
      this.bodyWrap.elem.appendChild(this.dummy);
      this.body = cloneDomElement(this.cloneBase.div)
        .addClass("lv-body")
        .addEvent("scroll", throttle(() => {
          this.scrollX("b");
        }, SCROLL_X_THROTTLE_TIMEOUT));
      this.bodyWrap.addChild(this.body);
      this.emptyMsg = cloneDomElement(this.cloneBase.div).addClass("lv-empty-msg");
      this.emptyMsg.elem.textContent = this.lang("common.noData");
      this.bodyWrap.addChild(this.emptyMsg);
      this.root.addChild(this.bodyWrap);
    }
    this.body.rmChild();
    this.rows = [];
  }

  protected generateFooter() {
    if (!this.footer) {
      this.footer = cloneDomElement(this.cloneBase.div)// NOTE: 横スクロールバーUIを担うため追加必須
        .addClass("lv-footer")
        .addEvent("scroll", throttle(() => {
          this.scrollX("f");
        }, SCROLL_X_THROTTLE_TIMEOUT));
      this.root.addChild(this.footer);
    }
    this.footer.rmChild();

    const dom = this.cloneBase.row.clone();
    const cols = this.generateRowColsImpl({
      dom,
      align: c => c.footerAlign,
      initialize: ({ column, cell }) => column.initializeFooterCell?.({ column, cell, getArrayData: () => this.value }),
    });
    if (this.columns.find(c => c.footerCell != null)) {
      this.footerRow = {
        dom: dom.rmAttr("data-none"),
        cols,
      };
    }
    this.footer.addChild(dom);
  }

  protected generateRows() {
    const h = this.body.elem.clientHeight;
    const rowLen = Math.max(Math.ceil(h / this.rowHeight), 1) + 1;
    const diff = rowLen - this.rows.length;
    if (diff === 0) return diff;
    if (diff < 0) {
      for (let i = this.rows.length - 1, il = this.rows.length + diff; i >= il; i--) {
        const row = this.rows[i];
        this.body.rmChild(row.dom);
        this.rows.splice(i, 1);
      }
      return diff;
    }
    for (let i = 0; i < diff; i++) {
      const dom = this.cloneBase.row.clone();
      const cols = this.generateRowColsImpl({
        dom,
        align: c => c.align,
        initialize: ({ column, cell }) => column.initializeCell?.({ column, cell, getArrayData: () => this.value }),
      });
      this.body.addChild(dom);
      this.rows.push({ dom, cols, data: null });
    }
    return diff;
  }

  protected renderHeader() {
    if (!this.headerRow) return;
    this.headerRow.cols.forEach(c => {
      if (c.column.headerCell) {
        if (typeof c.column.headerCell === "function") {
          c.column.headerCell({
            arrayData: this.value,
            ...c,
          });
        } else {
          c.wElems[0].textContent = c.column.headerCell;
        }
      }
    });
  }

  protected renderFooter() {
    if (!this.footerRow) return;
    this.footerRow.cols.forEach(c => {
      if (c.column.footerCell) {
        if (typeof c.column.footerCell === "function") {
          c.column.footerCell({
            arrayData: this.value,
            ...c,
          });
        } else {
          c.wElems[0].textContent = c.column.footerCell;
        }
      }
    });
  }

  protected renderBindData() {
    for (let i = 0, il = this.rows.length; i < il; i++) {
      const idx = this.firstIndex + i;
      const row = this.rows[i];
      const data = this.value?.[idx];
      if (data == null) {
        if (row.data) row.dom.setAttr("data-none");
        row.data = null;
        continue;
      }
      if (!row.data) row.dom.rmAttr("data-none");
      if (row.data === data) continue;
      row.data = data;
      row.dom.setAttr("data-nth", idx % 2 === 1 ? "odd" : "even");
      row.cols.forEach(c => {
        if (c.column.cell) {
          if (typeof c.column.cell === "function") {
            c.column.cell({
              arrayData: this.value,
              ...c,
              index: idx,
              rowData: data,
            });
          } else {
            c.wElems[0].textContent = c.column.cell;
          }
        } else {
          c.wElems[0].textContent = get(data, c.column.name)[0] ?? "";
        }
      });
    }
    return this;
  }

  protected renderSortOrder() {
    if (this.headerRow == null) return this;
    const showOrderTitle = (this.sortOrder ?? []).filter(o => o.direction !== "none").length > 1;
    this.columns.forEach(column => {
      if (!column.sort) return;
      const sortElem = column._sortElem;
      if (sortElem == null) return;
      let orderIndex = 0;
      const order = this.sortOrder?.find(o => {
        if (o.direction !== "none") orderIndex++;
        return o.name === column.name;
      });
      const direction = order?.direction || "none";
      sortElem.setAttribute("data-direction", direction);
      if (direction === "none" || !showOrderTitle) {
        if (sortElem.title) sortElem.removeAttribute("title");
      } else {
        sortElem.title = ` ${orderIndex} `;
      }
    });
    return this;
  }

  public render() {
    if (this.rows.length === 0) this.generateRows();
    this.renderHeader();
    this.renderFooter();
    this.renderSortOrder();
    this.renderBindData();
    return this;
  }

  protected resize() {
    this.generateRows();
    this.calcScrollBarWidth();
    this.renderBindData();
  }

  protected scrollY() {
    this.firstIndex = Math.max(0, Math.min((this.value?.length ?? 0) - this.rows.length, Math.floor(this.bodyWrap.elem.scrollTop / this.rowHeight)));
    this.body.elem.scrollTop = this.bodyWrap.elem.scrollTop - (this.rowHeight * this.firstIndex);
    this.renderBindData();
  }

  protected scrollX(triger: "h" | "b" | "f") {
    switch (triger) {
      case "b":
        this.footer.elem.scrollLeft = this.body.elem.scrollLeft;
        if (this.header) this.header.elem.scrollLeft = this.body.elem.scrollLeft;
        break;
      case "f":
        this.body.elem.scrollLeft = this.footer.elem.scrollLeft;
        if (this.header) this.header.elem.scrollLeft = this.footer.elem.scrollLeft;
        break;
      case "h":
        this.body.elem.scrollLeft = this.header!.elem.scrollLeft;
        this.footer.elem.scrollLeft = this.header!.elem.scrollLeft;
        break;
      default:
        break;
    }
  }

  protected calcScrollBarWidth() {
    const w = this.bodyWrap.elem.offsetWidth - this.bodyWrap.elem.clientWidth;
    if (this.header) this.header.elem.style.paddingRight = `${w}px`;
    this.footer.elem.style.paddingRight = `${w}px`;
  }

  protected calcStickyPosition(target?: { name: string; width: number; }) {
    const impl = (cols: Array<ListViewCol<D>>) => {
      let left = "";
      cols.forEach(({ column, elem }) => {
        if (!column.sticky) return;
        const w = target?.name === column.name ? `${target.width}px` : parseStrNum(column._width || column.width || this.cellWidth);
        if (left) {
          elem.elem.style.setProperty("left", left.indexOf("+") > 0 ? `calc(${left})` : left);
          left += ` + ${w}`;
        } else {
          left = w;
        }
      });
    };
    if (this.headerRow) impl(this.headerRow.cols);
    if (this.footerRow) impl(this.footerRow.cols);
    this.rows.forEach(row => impl(row.cols));
  }

  public setOnSortClick(fn: ListViewSortClickEvent | null | undefined) {
    this.onClickSort = fn;
    return this;
  }

  protected sortClick(column: ListViewColumnImpl<D>) {
    if (!column.sort || !this.onClickSort) return this;
    const cur = this.sortOrder?.find(o => o.name === column.name)?.direction || "none";
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
    this.onClickSort({
      columnName: column.name,
      currentSortOrder: this.sortOrder,
      currentDirection: cur,
      nextDirection: next,
    });
    return this;
  }

}

export const listViewRowNumColumn = <D extends Data>(props?: Partial<Omit<ListViewColumn<D>, "cell" | "initializeCell">>): ListViewColumn<D> => {
  return {
    name: "_rownum",
    align: "center",
    sticky: true,
    width: 50,
    resize: false,
    ...props,
    cell: ({ index, wElems }) => {
      wElems[0].textContent = `${index + 1}`;
    },
  };
};
