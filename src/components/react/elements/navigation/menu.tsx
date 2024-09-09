"use client";

import { usePathname } from "next/navigation";
import { HTMLAttributes, ReactNode, useEffect, useRef } from "react";
import { DownIcon } from "../icon";
import Link from "../link";
import { joinClassNames } from "../utilities";

type NavigationMenuListOptions = {
  children?: ReactNode;
};

type NavigationMenuListProps = OverwriteAttrs<HTMLAttributes<HTMLUListElement>, NavigationMenuListOptions>;

export const NavigationMenu = (props: NavigationMenuListProps) => {
  return <NavMenuList {...props} />;
};

const NavMenuList = (props: NavigationMenuListProps) => {
  return <ul {...props} className={joinClassNames("nav-menu-list", props.className)} />;
};

type NavigationMenuItemOptions = {
  children: ReactNode;
};

type NavigationMenuItemProps = OverwriteAttrs<HTMLAttributes<HTMLLIElement>, NavigationMenuItemOptions>;

type NavMenuNestProps = OverwriteProps<NavigationMenuItemProps, {
  icon?: ReactNode;
  text: ReactNode;
}>;

const toggleEvent = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    const elem = e.currentTarget.previousElementSibling as HTMLInputElement;
    if (elem) elem.checked = !elem.checked;
    e.preventDefault();
    return;
  }
  if (e.key === "ArrowRight") {
    const elem = e.currentTarget.previousElementSibling as HTMLInputElement;
    if (elem) elem.checked = true;
    e.preventDefault();
    return;
  }
  if (e.key === "ArrowLeft") {
    const elem = e.currentTarget.previousElementSibling as HTMLInputElement;
    if (elem) elem.checked = false;
    e.preventDefault();
    return;
  }
};

export const NavMenuNest = ({
  icon,
  text,
  children,
  ...props
}: NavMenuNestProps) => {
  return (
    <li
      {...props}
      className={joinClassNames("nav-menu-item-wrap", props.className)}
    >
      <label>
        <input
          className="nav-menu-check"
          type="checkbox"
        />
        <div
          className="nav-menu-item"
          tabIndex={0}
          onKeyDown={toggleEvent}
        >
          {icon && <NavMenuIcon>{icon}</NavMenuIcon>}
          {text}
          <div className="nav-menu-toggle">
            <DownIcon />
          </div>
        </div>
        <div className="nav-menu-children">
          <NavMenuList>
            {children}
          </NavMenuList>
        </div>
      </label>
    </li>
  );
};

type NavMenuLinkProps = OverwriteProps<NavigationMenuItemProps, {
  icon?: ReactNode;
  url: PagePath;
  selected?: boolean | "match" | "prefix-match" | ((pathname: string, url: string) => boolean);
}>;

export const NavMenuLink = ({
  icon,
  url,
  selected,
  children,
  className,
  ...props
}: NavMenuLinkProps) => {
  const pathname = usePathname();
  const current = (() => {
    if (typeof selected === "function") {
      return selected(pathname, url);
    }
    switch (selected) {
      case true:
      case false:
        return selected;
      case "match":
        return url === pathname;
      default:
        return new RegExp(`^${url}($|/)`).test(pathname);
    }
  })();
  const ref = useRef<HTMLLIElement>(null!);

  useEffect(() => {
    if (current) {
      let elem: HTMLElement = ref.current;
      while (elem != null) {
        if (elem.tagName === "LABEL") {
          const ielem = elem.querySelector(`:scope > input.nav-menu-check`) as HTMLInputElement;
          if (ielem) ielem.checked = true;
        }
        elem = elem.parentElement!;
        if (elem.tagName === "NAV") break;
      }
      setTimeout(() => {
        ref.current.scrollIntoView({ block: "nearest" });
      }, 300);
    }
  }, [pathname]);

  return (
    <li
      {...props}
      ref={ref}
      className={joinClassNames("nav-menu-item-wrap", className)}
    >
      <Link
        href={url}
        className="nav-menu-item"
        data-selected={current}
      >
        {icon && <NavMenuIcon>{icon}</NavMenuIcon>}
        {children}
      </Link>
    </li>
  );
};

export const NavMenuIcon = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} className={joinClassNames("nav-menu-icon", props.className)} />;
};
