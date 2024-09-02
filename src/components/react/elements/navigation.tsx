import { type ReactNode } from "react";
import { CrossIcon, MenuIcon } from "./icon";

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
        id="navOpen"
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
        <div className="nav-btn-wrap nav-close">
          <label className="nav-btn" htmlFor="navOpen">
            <CrossIcon />
          </label>
        </div>
        <div className="nav">
          {props.children}
        </div>
      </nav>
    </div>
  );
};
