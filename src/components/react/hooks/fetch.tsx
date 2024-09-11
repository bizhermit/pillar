"use client";

import { createContext, type ReactNode, use } from "react";
import $fetch, { FetchFailedResponse, FetchOptions, FetchResponse, optimizeHeader } from "../../utilities/fetch";
import { $alert, $confirm, MessageBoxAlertProps, MessageBoxConfirmProps } from "../elements/message-box";

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
} & FetchHookMessageBoxOptions;

type FetchHookOptions<U extends ApiPath, M extends Api.Methods> = FetchOptions & {
  done?: (res: FetchResponse<Api.Response<U, M>>) => (FetchHookCallbackReturnType | void);
  failed?: (res?: FetchFailedResponse) => (FetchHookCallbackReturnType | void);
  quiet?: boolean;
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

  const impl = async <U extends ApiPath, M extends Api.Methods>(
    url: U,
    method: M,
    params?: Api.Request<U, M> | FormData | null,
    opts?: FetchHookOptions<U, M>
  ) => {
    return new Promise<FetchResponse<Api.Response<U, M>>>(async (resolve, reject) => {
      const showMsgBox = (message: Api.Message | undefined, ret: FetchHookCallbackReturnType | undefined | void) => {
        if (ret?.quiet) return;
        if (opts?.quiet && ret?.quiet !== false) return;

        const msg = (message || ret?.message) ? {
          ...message,
          notEffectUnmount: true,
          ...ret?.message,
        } : undefined;

        if (msg) {
          if (ret?.messageBox === "confirm") {
            $confirm({
              ...(msg.buttonText ? {
                positiveButtonProps: {
                  children: msg.buttonText,
                }
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

        if (res.ok) {
          showMsgBox(res.message, opts?.done?.(res as FetchResponse<Api.Response<U, M>>));
          resolve(res as FetchResponse<Api.Response<U, M>>);
          return;
        }

        showMsgBox(res.message, opts?.failed?.(res));
        reject();
      } catch (e) {
        showMsgBox(undefined, opts?.failed?.());
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
