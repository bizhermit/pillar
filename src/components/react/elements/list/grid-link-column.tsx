import { UrlPath } from "@/objects/url";
import { type ReactNode } from "react";
import { get } from "../../../objects/struct";
import Link from "../link";
import { type ListGridColumn } from "./grid";

type BaseProps<D extends ListData> = {
  cell: NonNull<ListGridColumn<D>["cell"]>;
};

type CustomProps<D extends ListData> = {
  text?: ReactNode;
  role?: "button";
  target?: HTMLAnchorElement["target"];
  disabled?: boolean;
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
};

type ListGridLinkProps<D extends ListData> = Omit<PickPartial<ListGridColumn<D>, "name">, "cell"> & SwitchProps<BaseProps<D>, CustomProps<D>>;

export const listGridLinkColumn = <D extends ListData>({
  cell,
  text,
  role,
  target,
  disabled,
  link,
  ...props
}: ListGridLinkProps<D>): ListGridColumn<D> => {
  return {
    name: "_link",
    align: role === "button" ? "center" : undefined,
    resize: false,
    ...props,
    cell: cell ?? (({ name, index, rowValue }) => {
      const ret = link?.({ rowValue, name, index });
      if (ret.href == null) return null;
      return (
        <Link
          className={role === "button" ? undefined : "list-span"}
          href={ret.href}
          disabled={ret.disabled || disabled}
          target={ret.target ?? target}
          button={role === "button"}
        >
          {ret.text || (props.name ? get(rowValue, name)[0] : "") || text || ret.href || ""}
        </Link>
      );
    }),
  };
};