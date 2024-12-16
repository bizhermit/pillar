import { get } from "../../../objects/struct";
import { LIST_GRID_DEFAULT_ROW_HEIGHT, type ListGridColumn } from "./grid";

type BaseProps<D extends ListData> = {
  cell: NonNull<ListGridColumn<D>["cell"]>;
};

type CustomProps<D extends ListData> = {
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
  };
};

type ListGridImageProps<D extends ListData> = Omit<PickPartial<ListGridColumn<D>, "name">, "cell"> & SwitchProps<BaseProps<D>, CustomProps<D>>;

export const listGridImageColumn = <D extends ListData>({
  cell,
  imgWidth,
  imgHeight,
  altName,
  noSrcUrl: _noSrcUrl,
  image,
  ...props
}: ListGridImageProps<D>): ListGridColumn<D> => {
  const imgSize = `calc(${typeof props.width === "string" ? props.width : `${(props.width ?? LIST_GRID_DEFAULT_ROW_HEIGHT)}px`} * 0.8)`;
  const w = imgWidth ?? imgSize;
  const h = imgHeight ?? imgSize;
  const noSrcUrl = _noSrcUrl || "";

  return {
    name: "_img",
    width: LIST_GRID_DEFAULT_ROW_HEIGHT,
    align: "center",
    resize: false,
    ...props,
    cell: cell ?? (({ name, index, rowValue }) => {
      const ret = image?.({ rowValue, name, index });
      if (ret?.hide) return null;
      const src = ret?.src || (props.name ? (get(rowValue, name)[0] || noSrcUrl) : noSrcUrl);
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={ret?.alt || (altName ? (get(rowValue, altName)[0] || "") : "")}
          loading="lazy"
          style={{ width: w, height: h }}
        />
      );
    }),
  };
};
