"use client";

import { MenuLeftRightIcon } from "../icon";
import { navToggleRadioName } from "./consts";

export const NavSizeAutoButton = () => {
  return (
    <div
      className="nav-btn nav-auto"
      onClick={() => {
        document.querySelectorAll(`input[name="${navToggleRadioName}"]`).forEach(elem => {
          (elem as HTMLInputElement).checked = false;
        });
      }}
    >
      <MenuLeftRightIcon />
    </div>
  );
};
