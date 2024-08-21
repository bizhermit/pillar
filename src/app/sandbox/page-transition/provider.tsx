"use client";

import { createContext, ReactNode } from "react";

type ContextProps = {
  params?: any | null | undefined;
};

export const PageTransitionContext = createContext<ContextProps>({});

export const PageTransitionProvider = (props: {
  params: any;
  children: ReactNode;
}) => {
  return (
    <PageTransitionContext.Provider value={{
      params: props.params,
    }}>
      {props.children}
    </PageTransitionContext.Provider>
  );
};
