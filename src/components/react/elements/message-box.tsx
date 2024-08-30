"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "./button";

type MessageBoxChildrenProps = {
  close: () => Promise<void>;
};

type MessageBoxShowOptions = {
  classNames?: string;
  notEffectUnmount?: boolean;
};

type MessageBoxControllers = {
  resolve: (value?: any) => void;
  reject: () => void;
};

type MessageBoxContext = {
  close: () => Promise<void>;
  controllers: MessageBoxControllers;
  options?: MessageBoxShowOptions;
};

const show = (node: (props: MessageBoxChildrenProps) => ReactNode, controllers: MessageBoxControllers, opts?: MessageBoxShowOptions): MessageBoxContext => {
  const elem = document.createElement("dialog");
  elem.classList.add("dialog", "msg-dialog");
  if (opts?.classNames) elem.classList.add(opts.classNames);
  const root = createRoot(elem);
  document.body.appendChild(elem);

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") e.preventDefault();
  };
  elem.addEventListener("keydown", keydownHandler);

  const scrollTopBuf = document.documentElement.scrollTop;
  const scrollLeftBuf = document.documentElement.scrollLeft;
  const scrollHandler = (e: Event) => {
    e.preventDefault();
    document.documentElement.scrollTop = scrollTopBuf;
    document.documentElement.scrollLeft = scrollLeftBuf;
  };
  window.addEventListener("scroll", scrollHandler);

  const close = () => {
    return new Promise<void>((resolve) => {
      const unmount = (e: TransitionEvent) => {
        if (e.target !== e.currentTarget || !e.pseudoElement) return;
        elem.removeEventListener("transitioncancel", unmount);
        elem.removeEventListener("transitionend", unmount);
        elem.removeEventListener("keydown", keydownHandler);
        window.removeEventListener("scroll", scrollHandler);
        root.unmount();
        document.body.removeChild(elem);
        resolve();
      };
      elem.addEventListener("transitioncancel", unmount);
      elem.addEventListener("transitionend", unmount);
      elem.close();
    });
  };

  root.render(node({
    close,
  }));
  elem.showModal();
  return {
    close,
    controllers,
    options: opts,
  };
};

export const useMessageBox = () => {
  const ctxs = useRef<Array<MessageBoxContext>>([]);

  const unmountCtx = useCallback((ctx: MessageBoxContext) => {
    const idx = ctxs.current.findIndex(c => c === ctx);
    if (idx < 0) return;
    ctxs.current.splice(idx, 1);
  }, []);

  useEffect(() => {
    return () => {
      ctxs.current.forEach(ctx => {
        if (ctx.options?.notEffectUnmount) return;
        ctx.close();
        ctx.controllers.reject();
      });
    };
  }, []);

  return {
    alert: () => {
      return new Promise<void>(async (resolve, reject) => {
        const ctx = show(({ close }) => (
          <div style={{ padding: 30 }}>
            <Button
              onClick={() => {
                close().finally(() => {
                  unmountCtx(ctx);
                  resolve();
                });
              }}
            >
              close
            </Button>
          </div>
        ), { resolve, reject });
        ctxs.current.push(ctx);
      });
    },
    confirm: () => {
      return new Promise<boolean>(async (resolve, reject) => {
        const ctx = show(({ close }) => (
          <div style={{ padding: 30 }}>
            <Button
              onClick={async () => {
                await close();
                unmountCtx(ctx);
                resolve(true);
              }}
            >
              positive
            </Button>
            <Button
              onClick={async () => {
                await close();
                unmountCtx(ctx);
                resolve(false);
              }}
            >
              negative
            </Button>
          </div>
        ), { resolve, reject });
        ctxs.current.push(ctx);
      });
    },
  } as const;
};
