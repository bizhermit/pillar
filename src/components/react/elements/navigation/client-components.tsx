"use client";

import { type ReactNode } from "react";
import { lang } from "../../../i18n/client";
import { MenuLeftRightIcon } from "../icon";
import { navMinId, navOpenId, navToggleRadioName, navVisId } from "./consts";

const navVisBtnText = lang("navigation.spreadNav");
export const NavVisBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn nav-vis"
      type="button"
      title={navVisBtnText}
      aria-label={navVisBtnText}
      onClick={() => {
        const elem = document.querySelector(`#${navVisId}`);
        if (elem) (elem as HTMLInputElement).checked = true;
      }}
    >
      {props.children}
    </button>
  );
};

const navMinBtnText = lang("navigation.shrinkNav");
export const NavMinBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn nav-min"
      type="button"
      title={navMinBtnText}
      aria-label={navMinBtnText}
      onClick={() => {
        const elem = document.querySelector(`#${navMinId}`);
        if (elem) (elem as HTMLInputElement).checked = true;
      }}
    >
      {props.children}
    </button>
  );
};

const navOpenBtnText = lang("navigation.openNav");
export const NavOpenBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn"
      type="button"
      title={navOpenBtnText}
      aria-label={navOpenBtnText}
      onClick={() => {
        const elem = document.querySelector(`#${navOpenId}`);
        if (elem) (elem as HTMLInputElement).checked = true;
      }}
    >
      {props.children}
    </button>
  );
};

const navCloseBtnText = lang("navigation.openNav");
export const NavCloseBtn = (props: { children: ReactNode }) => {
  return (
    <button
      className="nav-btn nav-close"
      type="button"
      title={navCloseBtnText}
      aria-label={navCloseBtnText}
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

const navSizeAutoBtnText = lang("navigation.autoNav");
export const NavSizeAutoButton = () => {
  return (
    <button
      className="nav-btn nav-auto"
      type="button"
      title={navSizeAutoBtnText}
      aria-label={navSizeAutoBtnText}
      onClick={autoNav}
    >
      <MenuLeftRightIcon />
    </button>
  );
};
