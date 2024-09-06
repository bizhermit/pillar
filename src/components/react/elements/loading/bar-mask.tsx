"use client";

import { type HTMLAttributes, useEffect, useRef } from "react";
import { preventScroll } from "../../../dom/prevent-scroll";
import { joinClassNames } from "../utilities";

const LoadingBarWithMask = ({
  className,
  ...props
}: HTMLAttributes<HTMLDialogElement>) => {
  const ref = useRef<HTMLDialogElement>(null!);

  useEffect(() => {
    ref.current?.showModal();
    const releaseScroll = preventScroll();
    return () => {
      releaseScroll();
      ref.current.close();
    };
  }, []);

  return (
    <dialog
      {...props}
      ref={ref}
      className={joinClassNames("loading-bar loading-dialog", className)}
    />
  );
};

export default LoadingBarWithMask;
