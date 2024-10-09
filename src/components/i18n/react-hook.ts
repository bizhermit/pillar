import { useMemo } from "react";
import { langFactory } from "./factory";

export const useLang = (langs?: Array<Lang>) => {
  return useMemo(() => langFactory(langs), [...(langs ?? [])]);
};
