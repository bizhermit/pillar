"use client";

import { createContext, type Dispatch, type ReactNode, useEffect, useReducer, useState } from "react";

export type LayoutTheme = "auto" | "light" | "dark";

export const defaultLayoutTheme: LayoutTheme = "auto";

export const WindowSize = {
  xs: 1,
  s: 2,
  m: 3,
  l: 4,
  xl: 5,
};

export type WindowSizeValue = typeof WindowSize[keyof typeof WindowSize];

type LayoutContextProps = {
  windowSize: WindowSizeValue;
  mobile: boolean;
  theme: LayoutTheme;
  setTheme: Dispatch<LayoutTheme>;
};

export const LayoutContext = createContext<LayoutContextProps>({
  windowSize: WindowSize.m,
  mobile: false,
  theme: defaultLayoutTheme,
  setTheme: () => { },
});

type Props = {
  defaultLayoutTheme: LayoutTheme;
  children?: ReactNode;
};

export const LayoutProvider = (props: Props) => {
  const [theme, setTheme] = useReducer((_: LayoutTheme, action: LayoutTheme) => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", action);
      document.cookie = `theme=${action};path=/;${action === "auto" ? "max-age=0;" : ""}`;
    }
    return action;
  }, props.defaultLayoutTheme || defaultLayoutTheme);
  const [windowSize, setWindowSize] = useState<WindowSizeValue>(WindowSize.m);

  useEffect(() => {
    const resizeWindow = () => {
      const cw = document.body.clientWidth;
      if (cw > 1200) {
        setWindowSize(WindowSize.xl);
        return;
      }
      if (cw > 800) {
        setWindowSize(WindowSize.l);
        return;
      }
      if (cw > 600) {
        setWindowSize(WindowSize.m);
        return;
      }
      if (cw > 480) {
        setWindowSize(WindowSize.s);
        return;
      }
      setWindowSize(WindowSize.xs);
    };
    window.addEventListener("resize", resizeWindow);
    document.documentElement.setAttribute("data-theme", theme);
    return () => {
      window.removeEventListener("resize", resizeWindow);
    };
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        windowSize,
        mobile: windowSize < WindowSize.m,
        theme,
        setTheme,
      }}
    >
      {props.children}
    </LayoutContext.Provider>
  );
};

