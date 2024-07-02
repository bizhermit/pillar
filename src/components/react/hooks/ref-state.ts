import { useReducer, useRef } from "react";

export const useRefState = <T>(init: T) => {
  const r = useRef<T>(init);
  const [s, set] = useReducer((_: T, a: T) => a, init);
  return [s, set, r] as const;
};
