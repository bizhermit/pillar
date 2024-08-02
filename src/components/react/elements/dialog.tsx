"use client";

import { type CSSProperties, type HTMLAttributes, useEffect, useRef, useState } from "react";
import { throttle } from "../../utilities/throttle";
import { useRefState } from "../hooks/ref-state";
import { joinClassNames } from "./utilities";

type DailogOrder = "close" | "modal" | "modeless";
type DialogState = "closed" | "modal" | "modeless"

type DialogShowOptions = {
  modal?: boolean;
  anchor?: {
    element: HTMLElement;
    x?: "inner" | "outer" | "center" | "inner-left" | "inner-right" | "outer-left" | "outer-right";
    y?: "inner" | "outer" | "center" | "inner-top" | "inner-bottom" | "outer-top" | "outer-bottom";
    flexible?: boolean;
    styles?: CSSProperties;
    width?: "fill";
    height?: "fill";
  };
  callbackBeforeAnimation?: () => void;
  callback?: () => void;
};

type DialogCloseOptions = {
  callbackBeforeAnimation?: () => void;
  callback?: () => void;
};

type DialogHookConnectionParams = {
  toggle: <Order extends DailogOrder>(order: Order, opts?: Order extends "close" ? DialogCloseOptions : DialogShowOptions) => void;
};

type DialogHook = {
  state: DialogState;
  open: (options?: DialogShowOptions) => void;
  close: (options?: DialogCloseOptions) => void;
  hook: (params: DialogHookConnectionParams) => ((state: DialogState) => void);
};

type DialogOptions = {
  hook?: DialogHook["hook"];
  preventBackdropClose?: boolean;
  immediatelyMount?: boolean;
  keepMount?: boolean;
  mobile?: boolean;
};

type DialogProps = OverwriteAttrs<HTMLAttributes<HTMLDialogElement>, DialogOptions>;

export const Dialog = ({
  hook,
  preventBackdropClose,
  immediatelyMount,
  keepMount,
  mobile,
  ...props
}: DialogProps) => {
  const dref = useRef<HTMLDialogElement>(null!);
  const [state, setState, stateRef] = useRefState<DialogState>("closed");
  const hookRef = useRef<((state: DialogState) => void) | null>(null);
  const [mount, setMount] = useState(immediatelyMount === true);
  const [showOpts, setShowOpts] = useState<DialogShowOptions | null | undefined>();

  const toggle = <Order extends DailogOrder>(order: Order, opts?: Order extends "close" ? DialogCloseOptions : DialogShowOptions) => {
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
          opts?.callback?.();
        };
        dref.current.addEventListener("transitioncancel", unmount);
        dref.current.addEventListener("transitionend", unmount);
      }
      setState("closed");
      hookRef.current?.("closed");
      dref.current.close();
      opts?.callbackBeforeAnimation?.();
      return;
    }
    setMount(true);
    setState(order);
    setShowOpts(opts);
  };

  const resetPosition = () => {
    const anchor = showOpts?.anchor;
    if (anchor == null) return;

    const winW = document.body.offsetWidth;
    const winH = window.innerHeight;
    const wMax = dref.current.offsetWidth;
    const hMax = dref.current.offsetHeight;
    let posX = anchor.x || "center";
    let posY = anchor.y || "center";
    let rect = { top: 0, bottom: 0, left: 0, right: 0, width: winW, height: winH };

    const parseStyleNum = (num: number) => `${num}px`;

    rect = anchor.element.getBoundingClientRect();

    switch (anchor.width) {
      case "fill":
        dref.current.style.width = parseStyleNum(rect.width);
        break;
      default:
        break;
    }

    switch (anchor.height) {
      case "fill":
        dref.current.style.height = parseStyleNum(rect.height);
        break;
      default:
        break;
    }

    const posAbs = anchor.flexible === false;

    const scrollLeft = 0;
    switch (posX) {
      case "center":
        dref.current.style.right = "unset";
        dref.current.style.left = parseStyleNum(posAbs ?
          rect.left + rect.width / 2 - wMax / 2 + scrollLeft :
          Math.min(Math.max(0, rect.left + rect.width / 2 - wMax / 2 + scrollLeft), winW - wMax + scrollLeft)
        );
        break;
      case "inner":
        if (rect.left + wMax > winW && rect.right >= wMax) {
          dref.current.style.left = "unset";
          dref.current.style.right = parseStyleNum(winW - rect.right);
        } else {
          dref.current.style.right = "unset";
          dref.current.style.left = parseStyleNum(Math.min(rect.left, winW - wMax));
        }
        break;
      case "inner-left":
        dref.current.style.right = "unset";
        dref.current.style.left = parseStyleNum(posAbs ?
          rect.left :
          Math.min(rect.left, winW - wMax)
        );
        break;
      case "inner-right":
        dref.current.style.left = "unset";
        dref.current.style.right = parseStyleNum(posAbs ?
          winW - rect.right :
          winW - Math.max(rect.right, wMax)
        );
        break;
      case "outer":
        if (rect.right + wMax > winW && rect.left >= wMax) {
          dref.current.style.left = "unset";
          dref.current.style.right = parseStyleNum(winW - rect.left);
        } else {
          dref.current.style.right = "unset";
          dref.current.style.left = parseStyleNum(Math.min(rect.right, winW - wMax));
        }
        break;
      case "outer-left":
        dref.current.style.left = "unset";
        dref.current.style.right = parseStyleNum(posAbs ?
          winW - rect.left :
          Math.min(winW - rect.left, winW - wMax)
        );
        break;
      case "outer-right":
        dref.current.style.right = "unset";
        dref.current.style.left = parseStyleNum(posAbs ?
          rect.right :
          Math.min(rect.right, winW - wMax)
        );
        break;
      default: break;
    }

    const scrollTop = 0;
    switch (posY) {
      case "center":
        dref.current.style.bottom = "unset";
        dref.current.style.top = parseStyleNum(posAbs ?
          rect.top + rect.height / 2 - hMax / 2 + scrollTop :
          Math.min(Math.max(0, rect.top + rect.height / 2 - hMax / 2 + scrollTop), winH - hMax + scrollTop)
        );
        break;
      case "inner":
        if (rect.bottom > winH - rect.top && rect.bottom >= hMax) {
          dref.current.style.top = "unset";
          dref.current.style.bottom = parseStyleNum(winH - rect.bottom);
        } else {
          dref.current.style.bottom = "unset";
          dref.current.style.top = parseStyleNum(Math.min(rect.top, winH - hMax));
        }
        break;
      case "inner-top":
        dref.current.style.bottom = "unset";
        dref.current.style.top = parseStyleNum(posAbs ?
          rect.top :
          Math.min(rect.top, winH - hMax)
        );
        break;
      case "inner-bottom":
        dref.current.style.top = "unset";
        dref.current.style.bottom = parseStyleNum(posAbs ?
          winH - rect.bottom :
          Math.min(winH - rect.bottom, winH - hMax)
        );
        break;
      case "outer":
        if (rect.top > winH - rect.bottom && rect.top >= hMax) {
          dref.current.style.top = "unset";
          dref.current.style.bottom = parseStyleNum(Math.max(winH - rect.top));
        } else {
          dref.current.style.bottom = "unset";
          dref.current.style.top = parseStyleNum(Math.min(rect.bottom, winH - hMax));
        }
        break;
      case "outer-top":
        dref.current.style.top = "unset";
        dref.current.style.bottom = parseStyleNum(posAbs ?
          winH - rect.top :
          Math.min(winH - rect.top, winH - hMax)
        );
        break;
      case "outer-bottom":
        dref.current.style.bottom = "unset";
        dref.current.style.top = parseStyleNum(posAbs ?
          rect.bottom :
          Math.min(rect.bottom, winH - hMax)
        );
        break;
      default: break;
    }
  };

  hookRef.current = hook ? hook({ toggle }) : null;

  useEffect(() => {
    if (state === "closed") return;

    const resizeListener = throttle(() => {
      resetPosition();
    }, 40);
    window.addEventListener("resize", resizeListener);

    const transitionEndListener = () => {
      dref.current?.removeEventListener("transitionend", transitionEndListener);
      resetPosition();
      showOpts?.callback?.();
    };
    dref.current?.addEventListener("transitionend", transitionEndListener);

    resetPosition();
    return () => {
      window.removeEventListener("resize", resizeListener);
      dref.current?.removeEventListener("transitionend", transitionEndListener);
    };
  }, [showOpts]);

  useEffect(() => {
    if (state === "closed") return;
    dref.current.style.transitionDuration = "0s !important";
    if (state === "modal") dref.current.showModal();
    else dref.current.show();
    resetPosition();
    // dref.current.style.removeProperty("transition-duration");
    showOpts?.callbackBeforeAnimation?.();
    dref.current.scrollTop = 0;
    dref.current.scrollLeft = 0;
    hookRef.current?.(state);
  }, [state]);

  return (
    <dialog
      tabIndex={-1}
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
      data-pos={showOpts?.anchor != null}
      data-modal={state === "modal" ? "" : undefined}
      data-modeless={state === "modeless" ? "" : undefined}
      data-mobile={mobile ? "" : undefined}
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
    close: (opts) => con.current?.toggle("close", opts),
    hook: (c) => {
      con.current = c;
      return setState;
    },
  } as const;
};

