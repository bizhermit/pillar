"use client";

import { get } from "../../objects/struct";
import "../../styles/elements/list-view.scss";
import { cloneDomElement, DomElement } from "../element";

type Data = { [v: string | number | symbol]: any };
type Node = string | null | undefined;

type ListViewCol<D extends Data> = {
  column: ListViewColumn<D>;
  elem: DomElement<HTMLDivElement>;
  wElems: Array<HTMLElement>;
};
type ListViewRow<D extends Data> = {
  elem: DomElement<HTMLDivElement>;
  cols: Array<ListViewCol<D>>;
  data: D | null | undefined;
};

type RenderParams<D extends Data> = {
  arrayData: Array<D> | null | undefined;
  column: ListViewCol<D>;
};

type InitializeCellParams<D extends Data> = {
  column: ListViewColumn<D>;
  cellElem: HTMLDivElement;
};
type InitializeCellResponse<CellElems extends Array<HTMLElement>> = {
  elems: CellElems;
};

export type ListViewColumn<
  D extends Data,
  CellElems extends Array<HTMLElement> = Array<HTMLElement>,
  HCellElems extends Array<HTMLElement> = Array<HTMLElement>,
  FCellElems extends Array<HTMLElement> = Array<HTMLElement>,
> = {
  name: string;
  initializeHeaderCell?: (params: InitializeCellParams<D>) => (InitializeCellResponse<HCellElems> | void);
  headerCell?: Node | ((params: RenderParams<D>) => void);
  headerAlign?: "left" | "center" | "right";
  initializeFooterCell?: (params: InitializeCellParams<D>) => (InitializeCellResponse<FCellElems> | void);
  footerCell?: Node | ((params: RenderParams<D>) => void);
  footerAlign?: "left" | "center" | "right";
  initializeCell?: (params: InitializeCellParams<D>) => (InitializeCellResponse<CellElems> | void);
  cell?: Node | ((params: RenderParams<D> & { index: number; rowData: D | null | undefined; }) => void);
  align?: "left" | "center" | "right";
  sticky?: boolean;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
};

type ListViewProps<D extends Data> = {
  root: HTMLElement;
  value: Array<D> | null | undefined;
  columns: Array<ListViewColumn<D>>;
  lang: LangAccessor;
};

export const LIST_VIEW_DEFAULT_ROW_HEIGHT = 40;
export const LIST_VIEW_DEFAULT_CELL_WIDTH = 80;

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

  protected headerRow: ListViewRow<D> | undefined;
  protected footerRow: ListViewRow<D> | undefined;
  protected rows: Array<ListViewRow<D>>;

  protected columns: Array<ListViewColumn<D>>;
  protected value: Array<D> | null | undefined;

  protected firstIndex: number;
  protected rowHeight: number;

  constructor(props: ListViewProps<D>) {
    this.lang = props.lang;
    this.root = new DomElement(props.root);
    this.columns = props.columns;
    this.value = props.value;
    this.rows = [];

    this.root.elem.classList.add("lv-main");
    const div = document.createElement("div");
    this.cloneBase = {
      div,
      span: document.createElement("span"),
      row: cloneDomElement(div).addClass("lv-row").setAttr("data-none", ""),
      cell: cloneDomElement(div).addClass("lv-cell"),
    };

    this.bodyWrap = cloneDomElement(this.cloneBase.div)
      .addClass("lv-body-wrap")
      .addEvent("scroll", () => {
        this.scrollY();
      });
    this.dummy = this.cloneBase.div.cloneNode() as HTMLDivElement;
    this.dummy.classList.add("lv-dummy");
    this.bodyWrap.elem.appendChild(this.dummy);
    this.body = cloneDomElement(this.cloneBase.div)
      .addClass("lv-body")
      .addEvent("scroll", () => {
        this.scrollX("b");
      });
    this.bodyWrap.addChild(this.body);

    if (this.columns.find(c => c.headerCell != null)) {
      this.header = cloneDomElement(this.cloneBase.div)
        .addClass("lv-header")
        .addEvent("scroll", () => {
          this.scrollX("h");
        });
    }
    this.footer = cloneDomElement(this.cloneBase.div)// NOTE: 横スクロールバーUIを担うため追加必須
      .addClass("lv-footer")
      .addEvent("scroll", () => {
        this.scrollX("f");
      });

    this.observer = new ResizeObserver(() => {
      this.resize();
    });
    this.observer.observe(this.root.elem);

    this.firstIndex = 0;
    this.rowHeight = LIST_VIEW_DEFAULT_ROW_HEIGHT;
    this.root.elem.style.setProperty("--row-height", `${this.rowHeight}px`);

    if (this.header) this.root.addChild(this.header);
    this.root.addChild(this.bodyWrap).addChild(this.footer);

    this.emptyMsg = cloneDomElement(this.cloneBase.div).addClass("lv-empty-msg");
    this.emptyMsg.elem.textContent = this.lang("common.noData");
    this.bodyWrap.addChild(this.emptyMsg);

    this.generateHeader();
    this.generateFooter();
    this.render();
  }

  public dispose() {
    this.observer.disconnect();
    this.root.dispose();
    this.root.elem.textContent = "";
    return;
  }

  public getValue() {
    return this.value;
  }

  public setValue(value: Array<D> | null | undefined) {
    this.value = value;
    this.bodyWrap.elem.scrollTop = 0;
    this.dummy.style.height = `${(this.value?.length ?? 0) * this.rowHeight}px`;
    if (this.value?.length === 0) this.emptyMsg.setAttr("data-vis");
    else this.emptyMsg.rmAttr("data-vis");
    this.render();
    return this;
  }

  protected generateHeader() {
    if (!this.header) return;
    const row = this.cloneBase.row.clone().rmAttr("data-none");

    let left = "";
    const cols = this.columns.map(c => {
      const cell = this.cloneBase.cell.clone();
      cell.setAttr("data-align", c.headerAlign || "center");
      const parseStrNum = (w: number | string) => typeof w === "string" ? w : `${w}px`;
      if (c.width) cell.elem.style.width = parseStrNum(c.width);
      if (c.minWidth) cell.elem.style.minWidth = parseStrNum(c.minWidth);
      if (c.maxWidth) cell.elem.style.maxWidth = parseStrNum(c.maxWidth);
      if (c.sticky) {
        cell.setAttr("data-sticky");
        if (left) {
          cell.elem.style.setProperty("left", left.indexOf("+") > 0 ? `calc(${left})` : left);
          left += ` + ${parseStrNum(c.width || LIST_VIEW_DEFAULT_CELL_WIDTH)}`;
        } else {
          left = parseStrNum(c.width || LIST_VIEW_DEFAULT_CELL_WIDTH);
        }
      }
      row.addChild(cell);
      return {
        column: c,
        elem: cell,
        wElems: (() => {
          const init = c.initializeHeaderCell?.({
            column: c,
            cellElem: cell.elem,
          });
          if (init) return init.elems;
          const sElem = this.cloneBase.span.cloneNode() as HTMLSpanElement;
          sElem.classList.add("lv-span");
          cell.elem.appendChild(sElem);
          return [sElem];
        })(),
      };
    });
    this.headerRow = {
      elem: row,
      data: null,
      cols,
    };
    this.header.addChild(row);
  }

  protected generateFooter() {
    const row = this.cloneBase.row.clone();

    let left = "";
    const cols = this.columns.map(c => {
      const cell = this.cloneBase.cell.clone();
      if (c.footerAlign) cell.setAttr("data-align", c.footerAlign);
      const parseStrNum = (w: number | string) => typeof w === "string" ? w : `${w}px`;
      if (c.width) cell.elem.style.width = parseStrNum(c.width);
      if (c.minWidth) cell.elem.style.minWidth = parseStrNum(c.minWidth);
      if (c.maxWidth) cell.elem.style.maxWidth = parseStrNum(c.maxWidth);
      if (c.sticky) {
        cell.setAttr("data-sticky");
        if (left) {
          cell.elem.style.setProperty("left", left.indexOf("+") > 0 ? `calc(${left})` : left);
          left += ` + ${parseStrNum(c.width || LIST_VIEW_DEFAULT_CELL_WIDTH)}`;
        } else {
          left = parseStrNum(c.width || LIST_VIEW_DEFAULT_CELL_WIDTH);
        }
      }
      row.addChild(cell);
      return {
        column: c,
        elem: cell,
        wElems: (() => {
          const init = c.initializeFooterCell?.({
            column: c,
            cellElem: cell.elem,
          });
          if (init) return init.elems;
          const sElem = this.cloneBase.span.cloneNode() as HTMLSpanElement;
          sElem.classList.add("lv-span");
          cell.elem.appendChild(sElem);
          return [sElem];
        })(),
      };
    });
    if (this.columns.find(c => c.footerCell != null)) {
      this.footerRow = {
        elem: row.rmAttr("data-none"),
        data: null,
        cols,
      };
    }
    this.footer.addChild(row);
  }

  protected generateRows() {
    const h = this.body.elem.clientHeight;
    const rowLen = Math.max(Math.ceil(h / this.rowHeight), 1) + 1;
    const diff = rowLen - this.rows.length;
    if (diff === 0) return diff;
    if (diff < 0) {
      for (let i = this.rows.length - 1, il = this.rows.length + diff; i >= il; i--) {
        const row = this.rows[i];
        this.body.rmChild(row.elem);
        this.rows.splice(i, 1);
      }
      return diff;
    }
    for (let i = 0; i < diff; i++) {
      const row: ListViewRow<D> = {
        elem: this.cloneBase.row.clone(),
        data: null,
        cols: null!,
      };
      let left = "";
      row.cols = this.columns.map(c => {
        const cell = this.cloneBase.cell.clone();
        if (c.align) cell.setAttr("data-align", c.align);
        const parseStrNum = (w: number | string) => typeof w === "string" ? w : `${w}px`;
        if (c.width) cell.elem.style.width = parseStrNum(c.width);
        if (c.minWidth) cell.elem.style.minWidth = parseStrNum(c.minWidth);
        if (c.maxWidth) cell.elem.style.maxWidth = parseStrNum(c.maxWidth);
        if (c.sticky) {
          cell.setAttr("data-sticky");
          if (left) {
            cell.elem.style.setProperty("left", left.indexOf("+") > 0 ? `calc(${left})` : left);
            left += ` + ${parseStrNum(c.width || LIST_VIEW_DEFAULT_CELL_WIDTH)}`;
          } else {
            left = parseStrNum(c.width || LIST_VIEW_DEFAULT_CELL_WIDTH);
          }
        }
        row.elem.addChild(cell);
        return {
          column: c,
          elem: cell,
          wElems: (() => {
            const init = c.initializeCell?.({
              column: c,
              cellElem: cell.elem,
            });
            if (init) return init.elems;
            const sElem = this.cloneBase.span.cloneNode() as HTMLSpanElement;
            sElem.classList.add("lv-span");
            cell.elem.appendChild(sElem);
            return [sElem];
          })(),
        };
      });
      this.body.addChild(row.elem);
      this.rows.push(row);
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
            column: c,
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
            column: c,
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
        if (row.data) row.elem.setAttr("data-none");
        row.data = null;
        continue;
      }
      if (!row.data) row.elem.rmAttr("data-none");
      if (row.data === data) continue;
      row.data = data;
      row.elem.setAttr("data-nth", idx % 2 === 1 ? "odd" : "even");
      row.cols.forEach(c => {
        if (c.column.cell) {
          if (typeof c.column.cell === "function") {
            c.column.cell({
              arrayData: this.value,
              column: c,
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

  public render() {
    if (this.rows.length === 0) {
      this.generateRows();
    }
    this.renderHeader();
    this.renderFooter();
    this.renderBindData();
    return this;
  }

  public resize() {
    this.generateRows();
    this.renderBindData();
  }

  public scrollY() {
    this.firstIndex = Math.max(0, Math.min((this.value?.length ?? 0) - this.rows.length, Math.floor(this.bodyWrap.elem.scrollTop / this.rowHeight)));
    this.body.elem.scrollTop = this.bodyWrap.elem.scrollTop - (this.rowHeight * this.firstIndex);
    this.renderBindData();
  }

  public scrollX(triger: "h" | "b" | "f") {
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

}
