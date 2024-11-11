"use client";

import { createContext, type ReactNode, use, useLayoutEffect, useRef } from "react";
import $fetch, { type FetchFailedResponse, type FetchOptions, type FetchResponse, optimizeHeader } from "../../utilities/fetch";
import { type MessageBoxAlertProps, type MessageBoxConfirmProps, useMessageBox } from "../elements/message-box";

type FetchHookMessageBoxOptions =
  | {
    messageBox?: "alert" | undefined;
    message?: MessageBoxAlertProps;
    messageClosed?: () => Promise<void>;
  }
  | {
    messageBox: "confirm";
    message: MessageBoxConfirmProps;
    messageClosed?: (v: boolean) => Promise<void>;
  }
  ;

type FetchHookCallbackReturnType = {
  quiet?: boolean;
  unmountedContinue?: boolean;
} & FetchHookMessageBoxOptions;

type FetchHookCallbackCtx = {
  unmounted: boolean;
};

type FetchHookOptions<U extends ApiPath, M extends Api.Methods> = FetchOptions & {
  done?: (res: FetchResponse<Api.Response<U, M>>, ctx: FetchHookCallbackCtx) => (FetchHookCallbackReturnType | void);
  failed?: (res: FetchFailedResponse | undefined, ctx: FetchHookCallbackCtx) => (FetchHookCallbackReturnType | void);
  quiet?: boolean;
  unmountedContinue?: boolean;
};

type FetchContextProps = {
  headers?: FetchOptions["headers"];
};

export const FetchContext = createContext<FetchContextProps>({});

const getColor = (msgType: Api.Message["type"] | undefined): StyleColor => {
  switch (msgType) {
    case "e": return "danger";
    case "w": return "subdued";
    default: return "primary";
  }
};

type FetchProviderProps = {
  headers?: FetchOptions["headers"];
  children: ReactNode;
};

export const FetchProvider = (props: FetchProviderProps) => {
  return (
    <FetchContext.Provider value={{
      headers: props.headers
    }}>
      {props.children}
    </FetchContext.Provider>
  );
};

export const useFetch = <EndPoint extends ApiPath>() => {
  const ctx = use(FetchContext);
  const mounted = useRef(true);
  const { $alert, $confirm } = useMessageBox();

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const impl = async <U extends ApiPath, M extends Api.Methods>(
    url: U,
    method: M,
    params?: Api.Request<U, M> | FormData | null,
    opts?: FetchHookOptions<U, M>
  ) => {
    return new Promise<FetchResponse<Api.Response<U, M>>>(async (resolve, reject) => {
      const unmountedAbort = (ret: FetchHookCallbackReturnType | undefined | void) => {
        if (mounted.current || ret?.unmountedContinue) return false;
        if (opts?.unmountedContinue && ret?.unmountedContinue !== false) return false;
        // eslint-disable-next-line no-console
        console.warn(`abort fetched process cause unmounted.`);
        return true;
      };

      const showMsgBox = (message: Api.Message | undefined, ret: FetchHookCallbackReturnType | undefined | void) => {
        if (ret?.quiet) return;
        if (opts?.quiet && ret?.quiet !== false) return;

        const msg = (message || ret?.message) ? {
          ...message,
          ...ret?.message,
        } : undefined;

        if (msg) {
          if (ret?.messageBox === "confirm") {
            $confirm({
              ...(msg.buttonText ? {
                positiveButtonProps: {
                  children: msg.buttonText,
                },
              } : null),
              ...msg,
              color: msg.color ?? getColor(msg.type),
            }).then((v) => {
              ret?.messageClosed?.(v);
            });
          } else {
            $alert({
              ...(msg.buttonText ? {
                buttonProps: {
                  children: msg.buttonText,
                },
              } : null),
              ...msg,
              color: msg.color ?? getColor(msg.type),
            }).finally(() => {
              ret?.messageClosed?.();
            });
          }
        }
      };

      try {
        const res = await $fetch[method](url, params as any, {
          contentType: opts?.contentType,
          headers: {
            ...optimizeHeader(ctx.headers),
            ...optimizeHeader(opts?.headers),
          },
        });

        const callbackCtx: FetchHookCallbackCtx = {
          unmounted: !mounted.current,
        };

        if (res.ok) {
          const ret = opts?.done?.(res as FetchResponse<Api.Response<U, M>>, callbackCtx);
          if (unmountedAbort(ret)) return;
          showMsgBox(res.message, ret);
          resolve(res as FetchResponse<Api.Response<U, M>>);
          return;
        }

        const ret = opts?.failed?.(res, callbackCtx);
        if (unmountedAbort(ret)) return;
        showMsgBox({
          type: "e",
          title: `${res.status} | ${res.statusText}`,
          body: "操作をやり直してください。",
          ...res.message,
        }, ret);
        reject(res.statusText);
      } catch (e) {
        const ret = opts?.failed?.(undefined, {
          unmounted: !mounted.current,
        });
        if (unmountedAbort(ret)) return;
        showMsgBox({
          type: "e",
          body: "Fetch Error",
        }, ret);
        reject(e);
      }
    });
  };

  return {
    get: <U extends EndPoint>(
      url: U,
      params?: Api.Request<U, "get"> | FormData | null,
      options?: FetchHookOptions<U, "get">
    ) => impl(url, "get", params, options),
    put: <U extends EndPoint>(
      url: U,
      params?: Api.Request<U, "put"> | FormData | null,
      options?: FetchHookOptions<U, "put">
    ) => impl(url, "put", params, options),
    post: <U extends EndPoint>(
      url: U,
      params?: Api.Request<U, "post"> | FormData | null,
      options?: FetchHookOptions<U, "post">
    ) => impl(url, "post", params, options),
    delete: <U extends EndPoint>(
      url: U,
      params?: Api.Request<U, "delete"> | FormData | null,
      options?: FetchHookOptions<U, "delete">
    ) => impl(url, "delete", params, options),
  } as const;
};
