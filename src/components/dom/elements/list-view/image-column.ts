import { LIST_VIEW_DEFAULT_ROW_HEIGHT, type ListViewColumn } from ".";
import { DomElement } from "../../../dom/element";
import { get } from "../../../objects/struct";

export const listViewImageColumn = <D extends ListData>(props: Partial<Omit<ListViewColumn<D>, "initializeCell" | "cell">> & {
  imgWidth?: string | number;
  imgHeight?: string | number;
  altName?: string;
  noSrcUrl?: string;
  image?: (params: {
    rowValue: D;
    name: string;
    index: number;
  }) => {
    src: string | null | undefined;
    alt?: string | null | undefined;
    hide?: boolean;
  },
}): ListViewColumn<D> => {
  let imgBase: DomElement<HTMLImageElement> | undefined;
  const noSrcUrl = props.noSrcUrl || "";
  return {
    name: "_img",
    width: LIST_VIEW_DEFAULT_ROW_HEIGHT,
    align: "center",
    resize: false,
    ...props,
    initializeCell: ({ cell }) => {
      const img = imgBase?.clone() ?? (imgBase = new DomElement(document.createElement("img")).scope(dom => {
        dom.elem.loading = "eager";
        const imgSize = `calc(${typeof props.width === "string" ? props.width : `${(props.width ?? LIST_VIEW_DEFAULT_ROW_HEIGHT)}px`} * 0.8)`;
        dom.setStyleSize("width", props.imgWidth ?? imgSize);
        dom.setStyleSize("height", props.imgHeight ?? imgSize);
      }));
      cell.addChild(img);
      return {
        elems: [img.elem],
      };
    },
    cell: ({ rowValue, wElems, column, index }) => {
      if (!rowValue) return;
      const elem = wElems[0] as HTMLImageElement;
      const ret = props.image?.({ rowValue, name: column.name, index });
      elem.src = "";
      if (ret?.hide) {
        if (elem.style.display !== "none") elem.style.display = "none";
        elem.alt = "";
      } else {
        if (elem.style.display === "none") elem.style.removeProperty("display");
        elem.src = ret?.src || (props.name ? (get(rowValue, column.name)[0] || noSrcUrl) : noSrcUrl);
        elem.alt = ret?.alt || (props.altName ? (get(rowValue, props.altName)[0] || "") : "");
      }
    },
  };
};
