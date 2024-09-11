"use client";

import { createContext, type ReactNode, use } from "react";
import fetchApi, { FetchFailedResponse, FetchOptions, FetchResponse } from "../../utilities/fetch";
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

type FetchApiContextProps<EndPoint extends ApiPath> = {
  get: <U extends EndPoint>(
    url: U,
    params?: Api.Request<U, "get"> | FormData | null,
    options?: FetchHookOptions<U, "get">
  ) => Promise<Api.Response<U, "get">>;
  put: <U extends EndPoint>(
    url: U,
    params?: Api.Request<U, "put"> | FormData | null,
    options?: FetchHookOptions<U, "put">
  ) => Promise<Api.Response<U, "put">>;
  post: <U extends EndPoint>(
    url: U,
    params?: Api.Request<U, "post"> | FormData | null,
    options?: FetchHookOptions<U, "post">
  ) => Promise<Api.Response<U, "post">>;
  delete: <U extends EndPoint>(
    url: U,
    params?: Api.Request<U, "delete"> | FormData | null,
    options?: FetchHookOptions<U, "delete">
  ) => Promise<Api.Response<U, "delete">>;
};

export const FetchApiContext = createContext<FetchApiContextProps<ApiPath>>({
  get: () => {
    throw new Error("no fetch-api provider.");
  },
  put: () => {
    throw new Error("no fetch-api provider.");
  },
  post: () => {
    throw new Error("no fetch-api provider.");
  },
  delete: () => {
    throw new Error("no fetch-api provider.");
  },
});

export const useFetchApi = () => {
  return use(FetchApiContext);
};

type FetchApiProviderProps = {
  children: ReactNode;
};

const getColor = (msgType: Api.Message["type"] | undefined): StyleColor => {
  switch (msgType) {
    case "e": return "danger";
    case "w": return "subdued";
    default: return "primary";
  }
};

export const FetchApiProvider = (props: FetchApiProviderProps) => {
  const impl = async <U extends ApiPath, M extends Api.Methods>(
    url: U,
    method: M,
    params?: Api.Request<U, M> | FormData | null,
    opts?: FetchHookOptions<U, M>
  ) => {
    return new Promise<Api.Response<U, M>>(async (resolve, reject) => {
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
              ...msg,
              color: msg.color ?? getColor(msg.type),
            }).then((v) => {
              ret?.messageClosed?.(v);
            });
          } else {
            $alert({
              ...msg,
              color: msg.color ?? getColor(msg.type),
            }).finally(() => {
              ret?.messageClosed?.();
            });
          }
        }
      };

      try {
        const res = await fetchApi[method](url, params as any, {
          contentType: opts?.contentType,
          headers: opts?.headers,
        });

        if (res.ok) {
          showMsgBox(res.message, opts?.done?.(res as FetchResponse<Api.Response<U, M>>));
          resolve(res.data as Api.Response<U, M>);
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

  return (
    <FetchApiContext.Provider value={{
      get: (url, params, opts) => impl(url, "get", params, opts),
      put: (url, params, opts) => impl(url, "put", params, opts),
      post: (url, params, opts) => impl(url, "post", params, opts),
      delete: (url, params, opts) => impl(url, "delete", params, opts),
    }}>
      {props.children}
    </FetchApiContext.Provider>
  );
};
