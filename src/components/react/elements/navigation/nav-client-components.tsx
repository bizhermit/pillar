"use client";

import { MenuLeftRightIcon } from "../icon";

export const NavSizeAutoButton = ({ ids }: { ids: [string, string] }) => {
  return (
    <div
      className="nav-btn nav-auto"
      onClick={() => {
        document.querySelectorAll(`#${ids[0]},#${ids[1]}`).forEach(elem => {
          (elem as HTMLInputElement).checked = false;
        });
      }}
    >
      <MenuLeftRightIcon />
    </div>
  );
};
