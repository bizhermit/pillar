import { type ReactNode } from "react";
import { CrossIcon, MenuIcon, MenuLeftIcon, MenuRightIcon } from "./icon";

type NavigationProps = {
  header: ReactNode;
  footer?: ReactNode;
  content: ReactNode;
  children: ReactNode;
};

const toggleNavRadioName = "nav-toggle";

export const Navigation = (props: NavigationProps) => {
  return (
    <div className="wrap">
      <input
        className="nav-check"
        type="checkbox"
        id="navOpen"
      />
      <input
        className="nav-check"
        type="radio"
        name={toggleNavRadioName}
        id="navToggleVis"
      />
      <input
        className="nav-check"
        type="radio"
        name={toggleNavRadioName}
        id="navToggleMin"
      />
      <header className="header-wrap">
        <div className="nav-btn-wrap nav-open">
          <label className="nav-btn" htmlFor="navOpen">
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
          <label className="nav-btn nav-vis" htmlFor="navToggleVis">
            <MenuRightIcon />
          </label>
          <label className="nav-btn nav-close" htmlFor="navOpen">
            <CrossIcon />
          </label>
          <label className="nav-btn nav-min" htmlFor="navToggleMin">
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
