"use client";

import { type CSSProperties, type HTMLAttributes, useEffect, useRef, useState } from "react";
import { preventScroll } from "../../dom/prevent-scroll";
import { throttle } from "../../utilities/throttle";
import { useRefState } from "../hooks/ref-state";
import { joinClassNames } from "./utilities";

type DialogShowOptions = {
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

type ToggleFunction = <S extends boolean>(show: S, opts?: S extends true ? DialogShowOptions : DialogCloseOptions) => void;

type DialogRefConnectionParams = {
  toggle: ToggleFunction;
};

type DialogRef<Sync extends boolean | undefined> = {
  showed: Sync extends true ? boolean : null;
  open: (options?: DialogShowOptions) => void;
  close: (options?: DialogCloseOptions) => void;
};

interface DialogRefConnector<Sync extends boolean | undefined> extends DialogRef<Sync> {
  (params: DialogRefConnectionParams): ((show: boolean) => void);
}

type DialogOptions = {
  modeless?: boolean;
  ref?: DialogRef<any>;
  open?: boolean;
  preventBackdropClose?: boolean;
  preventEscapeClose?: boolean;
  immediatelyMount?: boolean;
  keepMount?: boolean;
  mobile?: boolean;
  preventRootScroll?: boolean;
  closeWhenScrolled?: boolean;
  transparent?: boolean;
  onClose?: () => void;
  onClickBackdrop?: () => void;
};

type DialogProps = OverwriteAttrs<HTMLAttributes<HTMLDialogElement>, DialogOptions>;

export const Dialog = ({
  modeless,
  ref,
  preventBackdropClose,
  preventEscapeClose,
  immediatelyMount,
  keepMount,
  mobile,
  preventRootScroll,
  closeWhenScrolled,
  transparent,
  onClose,
  onClickBackdrop,
  ...props
}: DialogProps) => {
  const dref = useRef<HTMLDialogElement>(null!);
  const [showed, toggleShowed, showedRef] = useRefState<boolean>(false);
  const refRef = useRef<((showed: boolean) => void) | null>(null);
  const [mount, setMount] = useState(immediatelyMount === true);
  const [showOpts, setShowOpts] = useState<DialogShowOptions | null | undefined>();
  const hasOpenProp = props.open != null;

  const toggle: ToggleFunction = (show, opts) => {
    if (!dref.current) {
      // eslint-disable-next-line no-console
      console.warn("not mounted dialog element");
      return;
    }
    if (show === showed) return;
    if (!show) {
      if (!keepMount) {
        let unmounted = false;
        const unmount = (e?: TransitionEvent) => {
          if (unmounted) return;
          unmounted = true;
          if (e != null && (e.target !== e.currentTarget || !e.pseudoElement)) return;
          dref.current.removeEventListener("transitioncancel", unmount);
          dref.current.removeEventListener("transitionend", unmount);
          if (!showedRef.current) setMount(false);
          opts?.callback?.();
        };
        dref.current.addEventListener("transitioncancel", unmount);
        dref.current.addEventListener("transitionend", unmount);
        setTimeout(() => {
          // NOTE: firefox is not work closing transition.
          if (!unmounted) unmount();
        }, 300);
      }
      toggleShowed(false);
      refRef.current?.(false);
      if (modeless) dref.current.hidePopover();
      else dref.current.close();
      dref.current.inert = true;
      opts?.callbackBeforeAnimation?.();
      onClose?.();
      return;
    }
    setMount(true);
    toggleShowed(show);
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

  refRef.current = ref ? (ref as unknown as DialogRefConnector<any>)({ toggle }) : null;

  useEffect(() => {
    if (!showed) return;

    const transitionEndListener = () => {
      dref.current?.removeEventListener("transitionend", transitionEndListener);
      resetPosition();
      showOpts?.callback?.();
    };
    dref.current?.addEventListener("transitionend", transitionEndListener);

    resetPosition();
    return () => {
      dref.current?.removeEventListener("transitionend", transitionEndListener);
    };
  }, [showOpts]);

  useEffect(() => {
    if (!showed) return;
    dref.current.inert = false;
    if (modeless) dref.current.showPopover();
    else dref.current.showModal();
    resetPosition();
    showOpts?.callbackBeforeAnimation?.();
    dref.current.scrollTop = 0;
    dref.current.scrollLeft = 0;
    refRef.current?.(showed);
  }, [showed]);

  useEffect(() => {
    if (!showed) return;

    const resizeListener = throttle(() => {
      resetPosition();
    }, 40);
    window.addEventListener("resize", resizeListener);

    const releaseScroll = (() => {
      if (preventRootScroll) return;
      if (closeWhenScrolled) {
        const ev = () => {
          toggle(false);
        };
        window.addEventListener("scroll", ev);
        return () => {
          window.removeEventListener("scroll", ev);
        };
      }
      return preventScroll();
    })();

    return () => {
      window.removeEventListener("resize", resizeListener);
      releaseScroll?.();
    };
  }, [showed, showOpts]);

  useEffect(() => {
    if (hasOpenProp) {
      toggle(props.open!);
    }
  }, [props.open]);

  return (
    <dialog
      tabIndex={-1}
      {...props}
      inert={true}
      open={undefined}
      className={joinClassNames("dialog", props.className)}
      ref={dref}
      onClick={preventBackdropClose ? props.onClick : (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const { offsetWidth, offsetHeight } = e.currentTarget;
        if (offsetX < 0 || offsetY < 0 || offsetX - offsetWidth > 0 || offsetY - offsetHeight > 0) {
          toggle(false);
        }
        props.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          if (!preventEscapeClose) toggle(false);
        }
        props.onKeyDown?.(e);
      }}
      aria-modal={!modeless}
      data-pos={showOpts?.anchor != null}
      data-mobile={mobile ? "" : undefined}
      data-transparent={transparent ? "" : undefined}
      popover={modeless ? "manual" : undefined}
    >
      {mount && props.children}
    </dialog>
  );
};

export const useDialogRef = <Sync extends boolean | undefined = undefined>(sync?: Sync): DialogRef<Sync> => {
  const [showed, setShowed] = useState<boolean>(false);
  const con = useRef<DialogRefConnectionParams | null>(null);

  const f = ((c) => {
    con.current = c;
    return sync ? setShowed : () => { };
  }) as DialogRefConnector<Sync>;
  f.showed = (sync ? showed : null) as DialogRef<Sync>["showed"];
  f.open = (opts) => con.current?.toggle(true, opts);
  f.close = (opts) => con.current?.toggle(false, opts);
  return f;
};

