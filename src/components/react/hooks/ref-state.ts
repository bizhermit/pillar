import { useCallback, useRef, useState } from "react";

export const useRefState = <T>(init: T) => {
  const r = useRef<T>(init);
  const [s, $s] = useState(init);
  const set = useCallback((v: T) => $s(r.current = v), []);
  return [s, set, r] as const;
};
