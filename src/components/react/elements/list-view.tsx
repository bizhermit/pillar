import { HTMLAttributes } from "react";
import "../../styles/elements/list-view.scss";

type ListViewOptions = {

};

type ListViewProps = OverwriteAttrs<Omit<HTMLAttributes<HTMLDivElement>, "children">, ListViewOptions>;

export const ListView = ({ }: ListViewProps) => {
  return (
    <div className="lv-main">

    </div>
  );
};
