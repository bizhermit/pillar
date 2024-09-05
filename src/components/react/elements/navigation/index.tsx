import { type ReactNode } from "react";
import { CrossIcon, MenuIcon, MenuLeftIcon, MenuRightIcon } from "../icon";
import { NavSizeAutoButton } from "./client-components";
import { navMinId, navOpenId, navToggleRadioName, navVisId } from "./consts";

type NavigationProps = {
  header: ReactNode;
  footer?: ReactNode;
  content: ReactNode;
  children: ReactNode;
};

export const Navigation = (props: NavigationProps) => {
  return (
    <div className="wrap">
      <input
        className="nav-check"
        type="checkbox"
        id={navOpenId}
      />
      <input
        className="nav-check"
        type="radio"
        name={navToggleRadioName}
        id={navVisId}
      />
      <input
        className="nav-check"
        type="radio"
        name={navToggleRadioName}
        id={navMinId}
      />
      <header className="header-wrap">
        <div className="nav-btn-wrap nav-open">
          <label className="nav-btn" htmlFor={navOpenId}>
            <MenuIcon />
          </label>
        </div>
        <div className="header">
          {props.header}
        </div>
      </header>
      <main className="main">
        {props.content}
      </main>
      {props.footer &&
        <footer className="footer">
          {props.footer}
        </footer>
      }
      <nav className="nav-wrap">
        <div className="nav-btn-wrap nav-toggle">
          <label className="nav-btn nav-vis" htmlFor={navVisId}>
            <MenuRightIcon />
          </label>
          <NavSizeAutoButton />
          <label className="nav-btn nav-close" htmlFor={navOpenId}>
            <CrossIcon />
          </label>
          <label className="nav-btn nav-min" htmlFor={navMinId}>
            <MenuLeftIcon />
          </label>
        </div>
        <div className="nav">
          <div className="nav-contents">
            {props.children}
          </div>
        </div>
      </nav>
    </div>
  );
};
