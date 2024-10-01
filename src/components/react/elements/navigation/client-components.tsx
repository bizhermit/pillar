"use client";

import { type ReactNode } from "react";
import { MenuLeftRightIcon } from "../icon";
import { navMinId, navOpenId, navToggleRadioName, navVisId } from "./consts";

export const NavVisBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn nav-vis"
      type="button"
      aria-label="Spread navigation"
      onClick={() => {
        const elem = document.querySelector(`#${navVisId}`);
        if (elem) (elem as HTMLInputElement).checked = true;
      }}
    >
      {props.children}
    </button>
  );
};

export const NavMinBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn nav-min"
      type="button"
      aria-label="Shrink navigation"
      onClick={() => {
        const elem = document.querySelector(`#${navMinId}`);
        if (elem) (elem as HTMLInputElement).checked = true;
      }}
    >
      {props.children}
    </button>
  );
};

export const NavOpenBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn"
      type="button"
      aria-label="Open navigation"
      onClick={() => {
        const elem = document.querySelector(`#${navOpenId}`);
        if (elem) (elem as HTMLInputElement).checked = true;
      }}
    >
      {props.children}
    </button>
  );
};

export const NavCloseBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn nav-close"
      type="button"
      aria-label="Close navigation"
      onClick={() => {
        const elem = document.querySelector(`#${navOpenId}`);
        if (elem) (elem as HTMLInputElement).checked = false;
      }}
    >
      {props.children}
    </button>
  );
};

export const closeNav = () => {
  const elem = document.querySelector(`#${navOpenId}`) as HTMLInputElement;
  if (elem) elem.checked = false;
};

export const autoNav = () => {
  document.querySelectorAll(`input[name="${navToggleRadioName}"]`).forEach(elem => {
    (elem as HTMLInputElement).checked = false;
  });
};

export const NavSizeAutoButton = () => {
  return (
    <button
      className="nav-btn nav-auto"
      type="button"
      aria-label="Auto navigation size"
      onClick={autoNav}
    >
      <MenuLeftRightIcon />
    </button>
  );
};
