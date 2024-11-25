"use client";

import { type ButtonHTMLAttributes, type MouseEvent, type MutableRefObject } from "react";
import "../../styles/elements/button.scss";
import { useRefState } from "../hooks/ref-state";
import { joinClassNames } from "./utilities";

type ButtonOptions = {
  ref?: MutableRefObject<HTMLButtonElement | null>;
  processing?: boolean;
  round?: boolean;
  outline?: boolean;
  color?: StyleColor;
  onClick?: (props: {
    event: MouseEvent<HTMLButtonElement>;
    unlock: (focus?: boolean) => void;
  }) => (void | boolean | Promise<void | boolean>);
};

export type ButtonProps = OverwriteAttrs<ButtonHTMLAttributes<HTMLButtonElement>, ButtonOptions>;

export const Button = ({
  onClick,
  processing,
  round,
  outline,
  color,
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
      type="button"
      {...props}
      className={joinClassNames("btn", props.className)}
      disabled={props.disabled || ing || processing}
      onClick={click}
      data-processing={ing || processing}
      data-round={round}
      data-outline={outline}
      data-color={color}
    />
  );
};
