import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { joinClassNames } from "./utilities";

type DailogOrder = "close" | "modal" | "modeless";
type DialogState = "closed" | "modal" | "modeless"

type DialogHookConnectionParams = {
  toggle: (order: DailogOrder) => void;
};

type DialogHook = {
  state: DialogState;
  open: (modal?: boolean) => void;
  close: () => void;
  hook: (params: DialogHookConnectionParams) => ((state: DialogState) => void);
};

type DialogOptions = {
  hook?: DialogHook["hook"];
  preventBackdropClose?: boolean;
  customPosition?: boolean;
  immediatelyMount?: boolean;
};

type DialogProps = OverwriteAttrs<HTMLAttributes<HTMLDialogElement>, DialogOptions>;

export const Dialog = ({
  hook,
  preventBackdropClose,
  customPosition,
  immediatelyMount,
  ...props
}: DialogProps) => {
  const dref = useRef<HTMLDialogElement>(null!);
  const [state, setState] = useState<DialogState>("closed");
  const hookRef = useRef<((state: DialogState) => void) | null>(null);
  const [mount, setMount] = useState(immediatelyMount === true);

  const toggle = (order: DailogOrder) => {
    if (!dref.current) {
      // eslint-disable-next-line no-console
      console.warn("not mounted dialog element");
      return;
    }
    if (order === "close") {
      setState("closed");
      hookRef.current?.("closed");
      dref.current.close();
      return;
    }
    setMount(true);
    setState(order);
  };

  hookRef.current = hook ? hook({ toggle }) : null;

  useEffect(() => {
    if (state === "closed") return;
    switch (state) {
      case "modal":
        dref.current.showModal();
        break;
      case "modeless":
        dref.current.show();
        break;
      default: break;
    }
    dref.current.scrollTop = 0;
    dref.current.scrollLeft = 0;
    hookRef.current?.(state);
  }, [state]);

  return (
    <dialog
      {...props}
      className={joinClassNames("dialog", props.className)}
      ref={dref}
      onClick={preventBackdropClose ? props.onClick : (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const { offsetWidth, offsetHeight } = e.currentTarget;
        if (offsetX < 0 || offsetY < 0 || offsetX - offsetWidth > 0 || offsetY - offsetHeight > 0) {
          toggle("close");
        }
        props.onClick?.(e);
      }}
      data-pos={customPosition}
    >
      {mount && props.children}
    </dialog>
  );
};

export const useDialog = (): DialogHook => {
  const [state, setState] = useState<DialogState>("closed");
  const con = useRef<DialogHookConnectionParams | null>(null);

  return {
    state,
    open: (modal) => con.current?.toggle(modal === false ? "modeless" : "modal"),
    close: () => con.current?.toggle("close"),
    hook: (c) => {
      con.current = c;
      return setState;
    },
  } as const;
};
