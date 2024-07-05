import { type HTMLAttributes } from "react";
import { joinClassNames } from "../utilities";

type Props = HTMLAttributes<HTMLDivElement>;

export const FormItemWrap = (props: Props) => {
  return (
    <div
      {...props}
      className={joinClassNames("ipt-wrap", props.className)}
    />
  );
};
