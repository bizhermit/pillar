import { throttle } from "@/utilities/throttle";
import { type CSSProperties, type HTMLAttributes, useEffect, useRef, useState } from "react";
import { useRefState } from "../hooks/ref-state";
import { joinClassNames } from "./utilities";

type DailogOrder = "close" | "modal" | "modeless";
type DialogState = "closed" | "modal" | "modeless"

type DialogShowOptions = {
  modal?: boolean;
  anchor?: HTMLElement | null | undefined;
  x?: "inner" | "outer" | "center" | "inner-left" | "inner-right" | "outer-left" | "outer-right";
  y?: "inner" | "outer" | "center" | "inner-top" | "inner-bottom" | "outer-top" | "outer-bottom";
  styles?: CSSProperties;
};

type DialogHookConnectionParams = {
  toggle: (order: DailogOrder, opts?: DialogShowOptions) => void;
};

type DialogHook = {
  state: DialogState;
  open: (options?: DialogShowOptions) => void;
  close: () => void;
  hook: (params: DialogHookConnectionParams) => ((state: DialogState) => void);
};

type DialogOptions = {
  hook?: DialogHook["hook"];
  preventBackdropClose?: boolean;
  customPosition?: boolean;
  immediatelyMount?: boolean;
  keepMount?: boolean;
};

type DialogProps = OverwriteAttrs<HTMLAttributes<HTMLDialogElement>, DialogOptions>;

export const Dialog = ({
  hook,
  preventBackdropClose,
  customPosition,
  immediatelyMount,
  keepMount,
  ...props
}: DialogProps) => {
  const dref = useRef<HTMLDialogElement>(null!);
  const [state, setState, stateRef] = useRefState<DialogState>("closed");
  const hookRef = useRef<((state: DialogState) => void) | null>(null);
  const [mount, setMount] = useState(immediatelyMount === true);
  const [showOpts, setShowOpts] = useState<DialogShowOptions | null | undefined>();

  const toggle = (order: DailogOrder, opts?: DialogShowOptions) => {
    if (!dref.current) {
      // eslint-disable-next-line no-console
      console.warn("not mounted dialog element");
      return;
    }
    if (order === "close") {
      if (!keepMount) {
        const unmount = (e: TransitionEvent) => {
          if (e.target !== e.currentTarget || !e.pseudoElement) return;
          dref.current.removeEventListener("transitioncancel", unmount);
          dref.current.removeEventListener("transitionend", unmount);
          if (stateRef.current === "closed") setMount(false);
        };
        if (stateRef.current === "modal") {
        } else {
        }
        dref.current.addEventListener("transitioncancel", unmount);
        dref.current.addEventListener("transitionend", unmount);
      }
      setState("closed");
      hookRef.current?.("closed");
      dref.current.close();
      return;
    }
    setMount(true);
    setState(order);
    setShowOpts(opts);
  };

  const resetPosition = () => {
    console.log(showOpts);
  };

  hookRef.current = hook ? hook({ toggle }) : null;

  useEffect(() => {
    if (state === "closed") return;
    const resizeListener = throttle(() => {
      resetPosition();
    }, 40);
    resetPosition();
    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, [showOpts]);

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
      data-modal={state === "modal" ? "" : undefined}
      data-modeless={state === "modeless" ? "" : undefined}
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
    open: (opts) => con.current?.toggle(opts?.modal === false ? "modeless" : "modal", opts),
    close: () => con.current?.toggle("close"),
    hook: (c) => {
      con.current = c;
      return setState;
    },
  } as const;
};
