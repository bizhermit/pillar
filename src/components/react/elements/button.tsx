"use client";

import { type ButtonHTMLAttributes, type MouseEvent, type MutableRefObject, type ReactNode } from "react";
import { useRefState } from "../hooks/ref-state";
import { joinClassNames } from "./utilities";

type ButtonOptions = {
  ref?: MutableRefObject<HTMLButtonElement | null>;
  processing?: boolean;
  onClick?: (props: {
    event: MouseEvent<HTMLButtonElement>;
    unlock: (focus?: boolean) => void;
  }) => (void | boolean | Promise<void | boolean>);
};

export type ButtonProps = OverwriteAttrs<ButtonHTMLAttributes<HTMLButtonElement>, ButtonOptions>;

export const ButtonIcon = (props: { children: ReactNode }) => {
  return <div className="btn-icon">{props.children}</div>;
};

export const Button = ({
  onClick,
  processing,
  ...props
}: ButtonProps) => {
  const [ing, setState, ingRef] = useRefState(false);

  const click = (event: MouseEvent<HTMLButtonElement>) => {
    if (props.disabled || ingRef.current || processing) {
      event.preventDefault();
      return;
    }
    setState(ingRef.current = true);
    const unlock = () => setState(ingRef.current = false);
    const res = onClick?.({ event, unlock });
    if (res == null || typeof res === "boolean") {
      if (res !== true) unlock();
    }
  };

  return (
    <button
      {...props}
      className={joinClassNames("btn", props.className)}
      disabled={props.disabled || ing || processing}
      onClick={click}
      data-processing={ing || processing}
    />
  );
};
