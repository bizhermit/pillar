import { type ReactNode } from "react";
import { CrossIcon, MenuIcon, MenuLeftIcon, MenuRightIcon } from "../icon";
import { joinClassNames } from "../utilities";
import { NavSizeAutoButton } from "./client-components";
import { navMinId, navOpenId, navToggleRadioName, navVisId } from "./consts";

type NavigationProps = {
  header?: ReactNode;
  headerClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  content: ReactNode;
  contentClassName?: string;
  children: ReactNode;
  navClassName?: string;
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
      <label
        className="nav-mask"
        htmlFor={navOpenId}
      />
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
          <div className={joinClassNames("nav-contents", props.navClassName)}>
            {props.children}
          </div>
        </div>
      </nav>
      <header className="header-wrap">
        <div className="nav-btn-wrap nav-open">
          <label className="nav-btn" htmlFor={navOpenId}>
            <MenuIcon />
          </label>
        </div>
        <div className={joinClassNames("header", props.headerClassName)}>
          {props.header}
        </div>
      </header>
      <main className={joinClassNames("main", props.contentClassName)}>
        {props.content}
      </main>
      {props.footer &&
        <footer className={joinClassNames("footer", props.footerClassName)}>
          {props.footer}
        </footer>
      }
    </div>
  );
};
