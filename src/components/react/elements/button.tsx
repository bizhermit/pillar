"use client";

import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { useRefState } from "../hooks/ref-state";

type ButtonOptions = {
  onClick?: (props: {
    event: MouseEvent<HTMLButtonElement>;
    unlock: (focus?: boolean) => void;
  }) => (void | boolean | Promise<void | boolean>);
};

type ButtonProps = OverwriteAttrs<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>, ButtonOptions>;

export const ButtonIcon = (props: { children: ReactNode }) => {
  return <div className="btn-icon">{props.children}</div>;
};

export const Button = ({
  onClick,
  ...props
}: ButtonProps) => {
  const [ing, setState, ingRef] = useRefState(false);

  const click = (event: MouseEvent<HTMLButtonElement>) => {
    if (props.disabled || ingRef.current) {
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
      disabled={props.disabled || ing}
      onClick={click}
    />
  );
};

// export const FormButton = (props: ButtonProps) => {
//   return (
//     <button {...props} onClick={() => {
//       console.log("form button click", props);
//     }} />
//   );
// };
