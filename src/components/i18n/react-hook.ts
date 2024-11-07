import { useMemo } from "react";
import { langFactory } from "./next-factory";

export const useLang = (langs?: Array<Lang>) => {
  return useMemo(() => langFactory(langs), [...(langs ?? [])]);
};
