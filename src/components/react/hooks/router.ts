import { useRouter as $ } from "next/navigation";
import { type DynamicUrlOptions, getDynamicPathname } from "../../objects/url";

const useRouter = () => {
  const router = $();

  return {
    ...router,
    push: (url: PagePath, params?: { [v: string | number | symbol]: any }, opts?: DynamicUrlOptions) => {
      router.push(getDynamicPathname(url, params, opts));
    },
    _push: router.push,
    replace: (url: PagePath, params?: { [v: string | number | symbol]: any }, opts?: DynamicUrlOptions) => {
      router.replace(getDynamicPathname(url, params, opts));
    },
    _replace: router.replace,
    replaceUrl: (url: PagePath, params?: { [v: string | number | symbol]: any }, opts?: DynamicUrlOptions & { stateData?: any; }) => {
      if (typeof window === "undefined") return;
      history.replaceState(opts?.stateData ?? history.state, "", getDynamicPathname(url, params, opts));
    },
  } as const;
};

export default useRouter;
