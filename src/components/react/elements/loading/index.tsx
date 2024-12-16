import { lazy, type HTMLAttributes } from "react";
import "../../../styles/elements/loading.scss";
import { joinClassNames } from "../utilities";

const LoadingBarWithMask = lazy(() => import("./bar-mask"));

type LoadingOptions = {
  mask: true;
  position?: undefined;
} | {
  mask?: false | undefined;
};

type LoadingBarOptions = LoadingOptions;

type LoadingBarProps = OverwriteAttrs<HTMLAttributes<HTMLElement>, LoadingBarOptions>;

export const LoadingBar = ({
  mask,
  ...props
}: LoadingBarProps) => {
  if (mask) return <LoadingBarWithMask {...props} />;
  return (
    <div
      {...props}
      className={joinClassNames("loading-bar", props.className)}
    />
  );
};
