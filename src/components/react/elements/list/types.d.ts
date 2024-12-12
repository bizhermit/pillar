type ListData = { [v: string | number | symbol]: any };

type ListCellAlign = "left" | "center" | "right"

type ListColumn<D extends ListData> = {
  name: string;
  headerAlign?: ListCellAlign;
  footerAlign?: ListCellAlign;
  align?: ListCellAlign;
  sticky?: boolean;
  fill?: boolean;
  resize?: boolean;
  resetResize?: any;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  sort?: boolean;
};

type ListSortDirection = "asc" | "desc" | "none"

type ListSortOrder = Array<{
  name: string;
  direction: ListSortDirection;
}>;

type ListSortClickEvent = (props: {
  columnName: string;
  currentDirection: ListSortDirection;
  nextDirection: ListSortDirection;
  currentSortOrder: ListSortOrder | null | undefined;
}) => void;

type ListOptions<D extends ListData> = {
  rowHeight?: number;
  cellWidth?: number | string;
};
