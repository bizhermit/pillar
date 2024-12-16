"use client";

import { type HTMLAttributes, type ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { clone } from "../../objects";
import "../../styles/elements/tab-container.scss";
import { ifStr, joinClassNames } from "./utilities";

type TabContainerHookConnectionParams = {
  get: () => string;
  set: (key: string, absolute?: boolean) => void;
};

type TabContainerRef = {
  key: string;
  setKey: (key: string, absolute?: boolean) => void;
};

interface TabContainerRefConnector extends TabContainerRef {
  (params: TabContainerHookConnectionParams): ((key: string) => void);
}

export const useTabContainer = (): TabContainerRef => {
  const [key, setKey] = useState<string>(null!);
  const con = useRef<TabContainerHookConnectionParams | null>(null);
  const set = useCallback((k: string, abs?: boolean) => con.current?.set(k, abs), []);

  const f = ((c) => {
    con.current = c;
    return (k) => {
      setKey(k);
    };
  }) as TabContainerRefConnector;
  f.key = key;
  f.setKey = set;
  return f;
};

type TabContainerOptions = {
  disabled?: boolean;
  defaultKey?: string;
  defaultMount?: boolean;
  keepMount?: boolean;
  onChange?: (key: string) => void;
  ref?: TabContainerRef;
  children: React.JSX.Element | Array<React.JSX.Element>;
};

export type TabContainerProps = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TabContainerOptions>;

export const getDefaultTabKey = (children: Array<React.JSX.Element>, defaultKey: TabContainerProps["defaultKey"]): string => {
  if (defaultKey) {
    if (children.find(c => c.key === defaultKey)) return defaultKey;
  }
  const c = children.findIndex(c => c.props.default);
  if (c < 0) return children[0].key!;
  return children[c].key!;
};

export const TabContainer = ({
  disabled,
  defaultKey,
  defaultMount,
  keepMount,
  children,
  onChange,
  ref,
  ...props
}: TabContainerProps) => {
  const $children = Array.isArray(children) ? children : [children];
  const refRef = useRef<ReturnType<TabContainerRefConnector> | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null!);

  const [mounted, switchMount] = useReducer((state: Set<string>, params: { key: string; action: "mount" | "unmount", keepMount?: boolean; }) => {
    if (params.action === "mount") {
      if (state.has(params.key)) return state;
      return clone(state).add(params.key);
    }
    if (keepMount) {
      if (params.keepMount !== false && !state.has(params.key)) {
        return state;
      }
    }
    if (params.keepMount) return state;
    const newSet = clone(state);
    newSet.delete(params.key);
    return newSet;
  }, new Set<string>(), (mounted) => {
    if (defaultMount) {
      $children.forEach(c => {
        if ((c.props as TabContentProps).defaultMount === false) return;
        mounted.add(c.key!);
      });
    } else {
      $children.forEach(c => {
        if ((c.props as TabContentProps).defaultMount) {
          mounted.add(c.key!);
        }
      });
    }
    return mounted;
  });

  const [key, setKey] = useReducer((state: string, action: string) => {
    if (!action || state === action) return state;
    switchMount({ action: "mount", key: action });
    return action;
  }, $children[0].key!, (_) => {
    const k = getDefaultTabKey($children, defaultKey);
    switchMount({ action: "mount", key: k });
    return k;
  });

  const select = (k: string) => {
    if (disabled || key === k) return;
    setKey(k);
  };

  refRef.current = (ref as unknown as TabContainerRefConnector)?.({
    get: () => key,
    set: (k, abs) => {
      if (disabled && !abs) return;
      setKey(k);
    },
  });

  useEffect(() => {
    refRef.current?.(key);
    onChange?.(key);

    return () => {
      if (ref) (ref as unknown as TabContainerRefConnector)(null!);
    };
  }, [key]);

  return (
    <div
      {...props}
      className={joinClassNames("tab-wrap", props.className)}
    >
      <div
        ref={tabsRef}
        role="tablist"
        className="tabs"
      >
        {$children.map(c => {
          return (
            <div
              key={c.key}
              className="tab-item"
              role="tab"
              aria-label={(c.props as TabContentProps)["aria-label"] ?? ifStr((c.props as TabContentProps).label)}
              aria-selected={c.key === key}
              aria-disabled={disabled}
              tabIndex={0}
              onClick={() => select(c.key!)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  select(c.key!);
                  e.preventDefault();
                }
              }}
            >
              {(c.props as TabContentProps).label}
            </div>
          );
        })}
      </div>
      <div className="tab-child">
        {$children.map(c => {
          const {
            label,
            defaultMount,
            keepMount,
            className,
            default: defaultSelect,
            "aria-label": _,
            ...cprops
          } = c.props as TabContentProps;

          return (
            <div
              {...cprops}
              key={c.key}
              role="tabpanel"
              className={joinClassNames("tab-cont", className)}
              data-current={key === c.key}
              onTransitionEnd={e => {
                if (e.currentTarget !== e.target || e.propertyName === "display") return;
                if (e.currentTarget.getAttribute("data-current") === "true") return;
                switchMount({ action: "unmount", key: c.key!, keepMount });
              }}
            >
              {mounted.has(c.key!) && c}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type TabContentOptions = {
  key: string;
  label: ReactNode;
  defaultMount?: boolean;
  keepMount?: boolean;
  default?: boolean;
};

type TabContentProps = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TabContentOptions>;

export const TabContent = (props: TabContentProps) => {
  return props.children;
};
