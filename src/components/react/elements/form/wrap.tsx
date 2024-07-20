import { ReactElement, ReactNode, type HTMLAttributes } from "react";
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

type RangeProps = Props & {
  from: ReactElement;
  to: ReactElement;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const FormItemRange = ({
  from,
  to,
  prefix,
  suffix,
  ...props
}: RangeProps) => {
  return (
    <div
      {...props}
      className={joinClassNames("ipt-range-wrap", props.className)}
    >
      {prefix}
      <FormItemWrap>
        {from}
      </FormItemWrap>
      <span className="ipt-sep">
        {props.children ?? "-"}
      </span>
      <FormItemWrap>
        {to}
      </FormItemWrap>
      {suffix}
    </div>
  );
};
