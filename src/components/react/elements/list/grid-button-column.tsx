import { type MouseEvent, type ReactNode } from "react";
import { get } from "../../../objects/struct";
import { Button } from "../button";
import { type ListGridColumn } from "./grid";

type BaseProps<D extends ListData> = {
  cell: NonNull<ListGridColumn<D>["cell"]>;
};

type CustomProps<D extends ListData> = {
  button?: (params: {
    rowValue: D;
    name: string;
    index: number;
  }) => {
    text?: string;
    disabled?: boolean;
    hide?: boolean;
    color?: StyleColor;
  };
  onClick: (props: {
    event: MouseEvent<HTMLButtonElement>;
    unlock: (focus?: boolean) => void;
    index: number;
    rowValue: D
    name: string;
  }) => (void | boolean | Promise<void | boolean>);
  text?: ReactNode;
  disabled?: boolean;
};

type ListGridButtonProps<D extends ListData> = Omit<PickPartial<ListGridColumn<D>, "name">, "cell"> & SwitchProps<BaseProps<D>, CustomProps<D>>;

export const listGridButtonColumn = <D extends ListData>({
  cell,
  button,
  onClick,
  text,
  disabled,
  ...props
}: ListGridButtonProps<D>): ListGridColumn<D> => {
  return {
    name: "_button",
    align: "center",
    resize: false,
    ...props,
    cell: cell ?? (({ name, index, rowValue }) => {
      const ret = button?.({ rowValue, name, index });
      if (ret?.hide) return null;
      return (
        <Button
          color={ret?.color}
          onClick={(p) => {
            return onClick?.({ ...p, name, index, rowValue });
          }}
          disabled={ret?.disabled || disabled}
        >
          {ret?.text || text || get(rowValue, name)[0]}
        </Button>
      );
    }),
  };
};