import { useEffect, useRef, useState } from "react";

type Options = {
  preventMemorize?: boolean;
};

export type LoadableArray<T extends { [v: string | number | symbol]: any } = { [v: string | number | symbol]: any }> =
  Array<T> | Readonly<Array<T>> | (() => Array<T>) | (() => Promise<Array<T>>);

const isArray = <T extends { [v: string | number | symbol]: any } | Promise<any> = { [v: string | number | symbol]: any }>(array: LoadableArray<T> | Promise<Array<T>> | null | undefined): array is (Array<T> | Readonly<Array<T>>) => {
  return Array.isArray(array);
};

export const useLoadableArray = <T extends { [v: string | number | symbol]: any } = { [v: string | number | symbol]: any }>(array: LoadableArray<T> | null | undefined, options?: Options) => {
  const initPromise = useRef<Promise<Array<T>>>(null!);
  const loadId = useRef(0);

  const [arr, setArr] = useState(() => {
    if (array == null || isArray(array)) return array ?? [];
    const ret = array();
    if (ret == null || isArray(ret)) return ret ?? [];
    initPromise.current = ret;
    return [];
  });

  const [loading, setLoading] = useState(initPromise.current != null);

  const load = (props?: {
    preventSwitchLoading?: boolean;
    callback?: (res: { ok: boolean; interruptted?: boolean; }) => void;
  }) => {
    if (array == null || isArray(array)) {
      setArr(array ?? []);
      props?.callback?.({ ok: true });
      return;
    }
    const ret = array();
    if (ret == null || isArray(ret)) {
      setArr(arr ?? []);
      props?.callback?.({ ok: true });
      return;
    }
    const id = ++loadId.current;
    if (!props?.preventSwitchLoading) setLoading(true);
    ret.then(r => {
      if (id !== loadId.current) {
        props?.callback?.({ ok: false, interruptted: true });
        return;
      }
      setArr(r ?? []);
      if (!props?.preventSwitchLoading) setLoading(false);
      props?.callback?.({ ok: true });
    }).catch(() => {
      props?.callback?.({ ok: false });
    });
  };

  useEffect(() => {
    if (loadId.current === 0) {
      if (initPromise.current == null) {
        loadId.current++;
        return;
      }
      initPromise.current.then(ret => {
        loadId.current++;
        setArr(ret ?? []);
        setLoading(false);
      });
      return;
    }

    if (options?.preventMemorize !== true) return;
    load();
  }, [array]);

  return [arr, loading, load] as const;
};
