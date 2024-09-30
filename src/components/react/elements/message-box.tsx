"use client";

import { type ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import { preventScroll } from "../../dom/prevent-scroll";
import { Button, type ButtonProps } from "./button";

type MessageBoxChildrenProps = {
  close: () => Promise<void>;
};

type MessageBoxShowOptions = {
  classNames?: string;
  mount?: (ctx: MessageBoxContext) => void;
  unmount?: (ctx: MessageBoxContext) => void;
};

type MessageBoxControllers = {
  resolve: (value?: any) => void;
  reject: () => void;
};

type MessageBoxContext = {
  close: () => Promise<void>;
  controllers: MessageBoxControllers;
  options?: MessageBoxShowOptions;
  state: {
    closing: boolean;
    closed: boolean;
  };
};

type MessageBoxButtonProps = Omit<ButtonProps, "onClick" | "disabled">

type MessageBoxProps = {
  title?: ReactNode;
  body?: ReactNode;
  color?: StyleColor;
  buttons: Array<ButtonProps>;
};

export const MessageBox = (props: MessageBoxProps) => {
  const [disabled, setDisabled] = useState(false);

  return (
    <div
      className="msgbox-main"
      data-color={props.color}
    >
      {props.title &&
        <h1 className="msgbox-title">
          {props.title}
        </h1>
      }
      {props.body &&
        <div className="msgbox-body">
          {props.body}
        </div>
      }
      <div className="msgbox-btns">
        {props.buttons.map((p, i) => {
          return (
            <Button
              className="msgbox-btn"
              color={props.color}
              {...p}
              key={i}
              disabled={disabled}
              onClick={async ({ event }) => {
                setDisabled(true);
                p.onClick?.({ unlock: () => { }, event });
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const createAndOpenDialog = (node: (props: MessageBoxChildrenProps) => ReactNode, controllers: MessageBoxControllers, opts?: MessageBoxShowOptions): MessageBoxContext => {
  const elem = document.createElement("dialog");
  elem.classList.add("dialog", "msgbox");
  if (opts?.classNames) elem.classList.add(opts.classNames);
  elem.setAttribute("aria-modal", "true");
  elem.setAttribute("data-transparent", "");
  elem.setAttribute("data-pos", "true");
  const root = createRoot(elem);
  document.body.appendChild(elem);

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") e.preventDefault();
  };
  elem.addEventListener("keydown", keydownHandler);

  const releaseScroll = preventScroll();

  const state = {
    closing: false,
    closed: false,
  };
  const close = () => {
    state.closing = true;
    return new Promise<void>((resolve) => {
      const unmount = (e: TransitionEvent) => {
        if (e.target !== e.currentTarget || !e.pseudoElement) return;
        elem.removeEventListener("transitioncancel", unmount);
        elem.removeEventListener("transitionend", unmount);
        elem.removeEventListener("keydown", keydownHandler);
        releaseScroll();
        root.unmount();
        document.body.removeChild(elem);
        resolve();
        state.closing = false;
        state.closed = true;
      };
      elem.addEventListener("transitioncancel", unmount);
      elem.addEventListener("transitionend", unmount);
      elem.close();
    });
  };

  root.render(node({ close }));
  elem.showModal();

  return {
    close,
    controllers,
    options: opts,
    state,
  } as const;
};

type MessageBoxBaseProps = Pick<MessageBoxProps,
  | "title"
  | "body"
  | "color"
>

export type MessageBoxCustomProps<T extends any, P extends MessageBoxBaseProps = MessageBoxBaseProps> = MessageBoxShowOptions & P & {
  component: (props: {
    props: Omit<P, keyof MessageBoxShowOptions>;
    close: (value: T) => Promise<void>;
  }) => MessageBoxProps;
};

export type MessageBoxAlertProps = MessageBoxShowOptions & MessageBoxBaseProps & {
  buttonProps?: MessageBoxButtonProps;
};

export type MessageBoxConfirmProps = MessageBoxShowOptions & MessageBoxBaseProps & {
  positiveButtonProps?: MessageBoxButtonProps;
  negativeButtonProps?: MessageBoxButtonProps;
};

const parseEndlines = (node: ReactNode) => {
  if (node == null || typeof node !== "string") return node;
  return node.split(/\r\n|\r|\n/g).map((t, i) => {
    return <span key={i}>{t}</span>;
  });
};

const optimizeProps = <P extends MessageBoxBaseProps>(props: P | string): P => {
  if (typeof props === "string") {
    return {
      body: parseEndlines(props),
    } as P;
  }
  return {
    ...props,
    title: parseEndlines(props.title),
    body: parseEndlines(props.body),
  } as P;
};

const $show = <T extends any, P extends MessageBoxBaseProps = MessageBoxBaseProps>({
  component,
  mount,
  unmount,
  classNames,
  ...props
}: MessageBoxCustomProps<T, P>) => {
  return new Promise<T>((resolve, reject) => {
    const ctx = createAndOpenDialog(({ close }) => (
      <MessageBox
        {...component({
          props: props as unknown as P,
          close: async (v: T) => {
            setTimeout(() => resolve(v), 0);
            try {
              await close();
            } finally {
              unmount?.(ctx);
            }
          },
        })}
      />
    ), {
      resolve,
      reject,
    }, {
      classNames,
    });
    mount?.(ctx);
  });
};

export const $alert = (props: MessageBoxAlertProps | string) => {
  return $show<void, MessageBoxAlertProps>({
    ...optimizeProps(props),
    component: ({ close, props: { buttonProps, ...p } }) => {
      return {
        ...p,
        buttons: [
          {
            children: "OK",
            autoFocus: true,
            ...buttonProps,
            onClick: () => {
              close();
            },
          },
        ]
      };
    }
  });
};

export const $confirm = (props: MessageBoxConfirmProps | string) => {
  return $show<boolean, MessageBoxConfirmProps>({
    ...optimizeProps<MessageBoxConfirmProps>(props),
    component: ({ close, props: { negativeButtonProps, positiveButtonProps, ...p } }) => {
      return {
        ...p,
        buttons: [
          {
            children: "キャンセル",
            outline: true,
            autoFocus: true,
            ...negativeButtonProps,
            onClick: () => {
              close(false);
            },
          },
          {
            children: "OK",
            ...positiveButtonProps,
            onClick: () => {
              close(true);
            },
          },
        ]
      };
    },
  });
};

// export const useMessageBox = () => {
//   const ctxs = useRef<Array<MessageBoxContext>>([]);

//   const unmountCtx = useCallback((ctx: MessageBoxContext) => {
//     const idx = ctxs?.current?.findIndex(c => c === ctx);
//     if (idx < 0) return;
//     ctxs.current.splice(idx, 1);
//   }, []);

//   useEffect(() => {
//     return () => {
//       ctxs.current.forEach(ctx => {
//         if (ctx.state.closing || ctx.state.closed) return;
//         ctx.close();
//         ctx.controllers.reject();
//       });
//     };
//   }, []);

//   return {
//     show: <T extends any, P extends MessageBoxBaseProps = MessageBoxBaseProps>(props: MessageBoxCustomProps<T, P>) => {
//       return $show<T, P>({
//         ...props,
//         mount: (ctx) => ctxs.current.push(ctx),
//         unmount: (ctx) => unmountCtx(ctx),
//       });
//     },
//     alert: (props: MessageBoxAlertProps | string) => {
//       return $alert({
//         ...optimizeProps(props),
//         mount: (ctx) => ctxs.current.push(ctx),
//         unmount: (ctx) => unmountCtx(ctx),
//       });
//     },
//     confirm: (props: MessageBoxConfirmProps | string) => {
//       return $confirm({
//         ...optimizeProps(props),
//         mount: (ctx) => ctxs.current.push(ctx),
//         unmount: (ctx) => unmountCtx(ctx),
//       });
//     },
//   } as const;
// };
