"use client";

import { type ReactNode } from "react";
import { useLang } from "../../../i18n/react-hook";
import { MenuLeftRightIcon } from "../icon";
import { navMinId, navOpenId, navToggleRadioName, navVisId } from "./consts";

export const NavVisBtn = (props: { children: ReactNode }) => {
  const lang = useLang();
  const navVisBtnText = lang("navigation.spreadNav");

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

export const NavMinBtn = (props: { children: ReactNode }) => {
  const lang = useLang();
  const navMinBtnText = lang("navigation.shrinkNav");

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

export const NavOpenBtn = (props: { children: ReactNode }) => {
  const lang = useLang();
  const navOpenBtnText = lang("navigation.openNav");

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

export const NavCloseBtn = (props: { children: ReactNode }) => {
  const lang = useLang();
  const navCloseBtnText = lang("navigation.openNav");

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

export const NavSizeAutoButton = () => {
  const lang = useLang();
  const navSizeAutoBtnText = lang("navigation.autoNav");

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
