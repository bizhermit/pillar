// base

export const get = <U = any>(data: { [v: string | number | symbol]: any } | null | undefined, name: string): [value: U | null | undefined, has: boolean] => {
  let has = false;
  if (data == null) return [undefined, false];
  const names = name.split(".");
  let v: any = data;
  for (const n of names) {
    if (v == null) return [undefined, false];
    try {
      has = n in v;
      v = v[n];
    } catch {
      return [undefined, false];
    }
  }
  return [v as U, has];
};

export const set = <U = any>(data: { [v: string | number | symbol]: any } | null | undefined, name: string, value: U) => {
  if (data == null) return value;
  const names = name.split(".");
  let o = data;
  for (const n of names.slice(0, names.length - 1)) {
    try {
      if (o[n] == null) o[n] = {};
      o = o[n];
    } catch {
      return value;
    }
  }
  try {
    o[names[names.length - 1]] = value;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return value;
};

export const appendValue = <U = any>(data: { [v: string | number | symbol]: any } | null | undefined, name: string, value: U) => {
  if (data == null) return value;
  const names = name.split(".");
  let o = data;
  for (const n of names.slice(0, names.length - 1)) {
    if (o[n] == null) o[n] = {};
    o = o[n];
  }
  const ov = o[names[names.length - 1]];
  if (ov == null) {
    o[names[names.length - 1]] = value;
    return value;
  }
  if (Array.isArray(ov)) {
    ov.push(value);
    return value;
  }
  o[names[names.length - 1]] = [ov, value];
  return value;
};

export const structKeys = <U extends { [v: string | number | symbol]: any }>(obj: U | null | undefined): Array<keyof U> => {
  return obj ? Object.keys(obj) : [];
};

// convert

type PickOneReturnValue<
  O extends { [v: string | number | symbol]: any } | null | undefined,
  K extends keyof Exclude<O, null | undefined>,
  RK extends string | number | symbol = K
> = O extends { [v: string | number | symbol]: any } ? (
  O[Extract<keyof O, K>] extends undefined ?
  { [P in RK]?: O[Extract<keyof O, K>] } :
  { [P in RK]: O[Extract<keyof O, K>] }
) : undefined;

export const pickOne = <
  O extends { [v: string | number | symbol]: any } | null | undefined = { [v: string | number | symbol]: any } | null | undefined,
  K extends keyof Exclude<O, null | undefined> = keyof Exclude<O, null | undefined>,
  RK extends string | number | symbol = K
>(obj: O, key: K, rename?: RK) => {
  if (!obj || !(key in obj)) return undefined as PickOneReturnValue<O, K, RK>;
  return { [rename ?? key]: obj[key] } as PickOneReturnValue<O, K, RK>;
};

type PickReturnValue<
  O extends { [v: string | number | symbol]: any } | null | undefined,
  K extends keyof Exclude<O, null | undefined>
> = O extends { [v: string | number | symbol]: any } ? Pick<O, K> : undefined;

export const pick = <
  O extends { [v: string | number | symbol]: any } | null | undefined = { [v: string | number | symbol]: any } | null | undefined,
  K extends keyof Exclude<O, null | undefined> = keyof Exclude<O, null | undefined>
>(obj: O, ...keys: Array<K>) => {
  if (!obj) return undefined as PickReturnValue<O, K>;
  const ret: { [v: string | number | symbol]: any } = {};
  keys.forEach(k => {
    if (k in obj) ret[k] = obj[k];
  });
  if (Object.keys(ret).length === 0) return undefined as PickReturnValue<O, K>;
  return ret as PickReturnValue<O, K>;
};

export const nonNullStruct = <U extends { [v: string | number | symbol]: any }>(obj: U | null | undefined) => {
  if (obj == null) return undefined;
  const ret: { [v: string | number | symbol]: any } = {};
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (v == null) return;
    ret[k] = v;
  });
  if (Object.keys(ret).length === 0) return undefined;
  return ret as U;
};

export const convertNullableStruct = <U extends { [v: string | number | symbol]: any }>(struct: Partial<U> | null | undefined, nullCheckFunc?: (struct: Partial<U>) => boolean) => {
  if (struct == null) return undefined;
  Object.keys(struct).forEach(k => {
    const v = struct[k];
    if (v == null || v === "") (struct as { [v: string]: any })[k] = undefined;
  });
  if (!Object.keys(struct).some(k => struct[k] != null)) return undefined;
  if (nullCheckFunc?.(struct)) return undefined;
  return struct as Required<U>;
};

export const withoutNullValueStruct = <
  U extends { [key: string | number | symbol]: any }
>(struct: U | null | undefined) => {
  const ret = { ...struct };
  structKeys(struct).forEach(key => {
    if (ret[key] != null) return;
    delete ret[key];
  });
  return ret as Partial<U>;
};
