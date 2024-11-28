import { type ListViewColumn } from ".";
import { DomElement } from "../../../dom/element";
import { get } from "../../../objects/struct";
import "../../../styles/elements/button.scss";

type Data = { [v: string | number | symbol]: any };

export const listViewButtonColumn = <D extends Data>(props: Partial<Omit<ListViewColumn<D>, "initializeCell" | "cell">> & {
  text?: string;
  button?: (params: {
    rowData: D;
    name: string;
    index: number;
  }) => {
    text?: string;
    disabled?: boolean;
    hide?: boolean;
    color?: StyleColor;
  };
  onClick: (params: {
    rowData: D;
    index: number;
    name: string;
  }) => void;
}): ListViewColumn<D> => {
  let buttonBase: DomElement<HTMLButtonElement> | undefined;
  return {
    name: "_button",
    align: "center",
    ...props,
    initializeCell: ({ cell, getArrayData, column }) => {
      const btn = buttonBase?.clone() ?? (buttonBase = new DomElement(document.createElement("button")));
      btn.elem.type = "button";
      btn.addClass("btn").setAttr("data-noanimation").addEvent("click", (e) => {
        const index = (e.currentTarget as any).lvdata;
        if (index == null || typeof index !== "number") return;
        const rowData = getArrayData()?.[index];
        if (!rowData) return;
        const ret = props.button?.({ rowData, name: column.name, index });
        if (ret?.disabled || ret?.hide) return;
        props.onClick({ rowData, index, name: column.name });
      });
      if (props.text) btn.elem.textContent = props.text;
      cell.addChild(btn);
      return {
        elems: [btn.elem],
      };
    },
    cell: ({ rowData, column, wElems, index }) => {
      if (!rowData) return;
      const ret = props.button?.({ rowData, name: column.name, index });
      const elem = wElems[0];
      if (ret) {
        if (ret.disabled) {
          if (elem.getAttribute("aria-disabled") !== "true") elem.setAttribute("aria-disabled", String(elem.inert = true));
        } else {
          if (elem.getAttribute("aria-disabled") === "true") elem.setAttribute("aria-disabled", String(elem.inert = false));
        }
        if (ret.hide) {
          if (elem.style.display !== "none") elem.style.display = "none";
        } else {
          if (elem.style.display === "none") elem.style.removeProperty("display");
        }
        if (ret.color) {
          if (elem.getAttribute("data-color") !== ret.color) elem.setAttribute("data-color", ret.color);
        } else {
          if (elem.getAttribute("data-color")) elem.removeAttribute("data-color");
        }
      }
      if (ret?.disabled || ret?.hide) {
        delete (elem as any).lvdata;
      } else {
        (elem as any).lvdata = index;
      }
      elem.textContent = ret?.text || (props.name ? get(rowData, props.name)[0] : "") || props.text || "";
    },
  };
};
