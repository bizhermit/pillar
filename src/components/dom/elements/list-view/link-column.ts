import { type ListViewColumn } from ".";
import { DomElement } from "../../../dom/element";
import { get } from "../../../objects/struct";
import { type UrlPath } from "../../../objects/url";
import "../../../styles/elements/button.scss";

export const listViewLinkColumn = <D extends ListData>(props: Partial<Omit<ListViewColumn<D>, "initializeCell" | "cell">> & {
  text?: string;
  role?: "button";
  target?: HTMLAnchorElement["target"];
  link: (params: {
    rowValue: D;
    name: string;
    index: number;
  }) => {
    text?: string;
    href: UrlPath | null | undefined;
    target?: HTMLAnchorElement["target"];
    disabled?: boolean;
  };
  interceptor?: (href: string) => void,
}): ListViewColumn<D> => {
  let anchorBase: DomElement<HTMLAnchorElement> | undefined;
  return {
    name: "_link",
    align: props.role === "button" ? "center" : undefined,
    resize: false,
    ...props,
    initializeCell: ({ cell }) => {
      const anchor = anchorBase?.clone() ?? (anchorBase = new DomElement(document.createElement("a")));
      if (props.role) {
        anchor.setAttr("data-noanimation").elem.role = props.role;
      } else {
        anchor.addClass("list-span");
      }
      if (props?.target) anchor.elem.target = props.target;
      if (props.text) anchor.elem.textContent = props.text;
      if (props.interceptor) {
        anchor.addEvent("click", (e) => {
          e.preventDefault();
          props.interceptor!((e.currentTarget as HTMLAnchorElement).href);
        });
      }
      cell.addChild(anchor);
      return {
        elems: [anchor.elem],
      };
    },
    cell: ({ rowValue, wElems, column, index }) => {
      if (!rowValue) return;
      const elem = wElems[0] as HTMLAnchorElement;
      const ret = props.link({ rowValue, name: column.name, index });
      if (ret.disabled) {
        if (elem.getAttribute("aria-disabled") !== "true") elem.setAttribute("aria-disabled", String(elem.inert = true));
      } else {
        if (elem.getAttribute("aria-disabled") === "true") elem.setAttribute("aria-disabled", String(elem.inert = false));
      }
      if (ret.href == null) {
        if (elem.style.display !== "none") elem.style.display = "none";
      } else {
        if (elem.style.display === "none") elem.style.removeProperty("display");
      }
      elem.href = ret.href || "";
      if ("target" in ret) elem.target = ret.target || "";
      elem.textContent = ret.text || (props.name ? get(rowValue, props.name)[0] : "") || props.text || elem.href || "";
    },
  };
};
