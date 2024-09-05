"use client";

import { MenuLeftRightIcon } from "../icon";
import { navOpenId, navToggleRadioName } from "./consts";

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
    <div
      className="nav-btn nav-auto"
      onClick={autoNav}
    >
      <MenuLeftRightIcon />
    </div>
  );
};
