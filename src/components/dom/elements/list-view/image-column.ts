import { LIST_VIEW_DEFAULT_ROW_HEIGHT, type ListViewColumn } from ".";
import { DomElement } from "../../../dom/element";
import { get } from "../../../objects/struct";

export const listViewImageColumn = <D extends ListData>(props: Partial<Omit<ListViewColumn<D>, "initializeCell" | "cell">> & {
  imgWidth?: string | number;
  imgHeight?: string | number;
  altName?: string;
  image?: (params: {
    rowValue: D;
    name: string;
    index: number;
  }) => {
    src: string | null | undefined;
    alt?: string | null | undefined;
  },
}): ListViewColumn<D> => {
  let imgBase: DomElement<HTMLImageElement> | undefined;
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
      elem.src = ret?.src ?? (get(rowValue, column.name)[0] || "");
      elem.alt = ret?.alt ?? ((props.altName ? get(rowValue, props.altName)[0] : "") || "");
    },
  };
};
