import type { RequestInit } from "next/dist/server/web/spec-extension/request";
import { convertFormDataToStruct, convertStructToFormData } from "../objects/form-data";
import { getDynamicPathnameContext } from "../objects/url";

export type FetchOptions = {
  contentType?: "json" | "formData";
  headers?: { [v: string]: any } | (() => { [v: string]: any });
};

export type FetchResponse<T> = {
  ok: true;
  status: number;
  statusText: string;
  message: Api.Message | undefined;
  data: T;
};

export type FetchFailedResponse = {
  ok: false;
  status: number;
  statusText: string;
  message: Api.Message | undefined;
  data: undefined;
};

const toJson = <T extends any>(text: string | null | undefined): { data: T; message: Api.Message | undefined } => {
  if (text == null) {
    return {
      message: undefined,
      data: undefined as T,
    };
  }
  try {
    const json = JSON.parse(text);
    return {
      message: json.message,
      data: json.data as T,
    };
  } catch {
    return {
      message: undefined,
      data: text as T,
    };
  }
};

const handleResponse = <T extends any>(
  ok: boolean,
  status: number,
  statusText: string | null | undefined,
  text: string | null | undefined
): (FetchResponse<T> | FetchFailedResponse) => {
  const json = toJson(text);
  return {
    ok,
    status,
    statusText: statusText || "",
    message: json.message,
    data: (status === 204 ? undefined : json.data) as any,
  };
};

const impl = async <T extends any>(url: string, init?: RequestInit) => {
  const res = await fetch(url, init);
  return handleResponse<T>(res.ok, res.status, res.statusText, await res.text());
};

const isValidBodyParams = (params?: any) => {
  if (params == null) return true;
  const t = typeof params;
  return !(t === "string" || t === "bigint" || t === "number" || t === "boolean");
};

const convertToRequestInit = (params?: any, options?: FetchOptions, noBody?: boolean): RequestInit => {
  const contentType = options?.contentType ?? "json";
  const headers = typeof options?.headers === "function" ? options.headers() : options?.headers;
  if (noBody) {
    return { headers };
  }
  if (contentType === "formData") {
    return {
      headers,
      body: (() => {
        if (params instanceof FormData) return params;
        if (params == null || !isValidBodyParams(params)) return new FormData();
        return convertStructToFormData(params);
      })(),
    };
  }
  return {
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      ...headers,
    },
    body: (() => {
      if (params instanceof FormData) {
        return JSON.stringify(convertFormDataToStruct(params));
      }
      if (!isValidBodyParams(params)) return "{}";
      return JSON.stringify(params);
    })(),
  };
};

const update = <U extends ApiPath, M extends Api.Methods>(url: U, method: M, params: any = undefined, options?: FetchOptions) => {
  const ctx = getDynamicPathnameContext(url, params);
  return impl<Api.Response<U, M>>(ctx.pathname, { method, ...convertToRequestInit(ctx.data, options) });
};

const fetchApi = {
  get: <U extends ApiPath>(url: U, params?: Api.Request<U, "get"> | FormData | null, options?: FetchOptions) => {
    const ctx = getDynamicPathnameContext(url, params as any, { appendQuery: true });
    return impl<Api.Response<U, "get">>(ctx.pathname, { method: "get", ...convertToRequestInit(ctx.data, options, true) });
  },
  put: <U extends ApiPath>(url: U, params?: Api.Request<U, "put"> | FormData | null, options?: FetchOptions) => {
    return update(url, "put", params, options);
  },
  post: <U extends ApiPath>(url: U, params?: Api.Request<U, "post"> | FormData | null, options?: FetchOptions) => {
    return update(url, "post", params, options);
  },
  delete: <U extends ApiPath>(url: U, params?: Api.Request<U, "delete"> | FormData | null, options?: FetchOptions) => {
    return update(url, "delete", params, options);
  },
};

export default fetchApi;
