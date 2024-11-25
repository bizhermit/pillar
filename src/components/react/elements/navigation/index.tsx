import { type ReactNode } from "react";
import "../../../styles/elements/navigation.scss";
import { CrossIcon, MenuIcon, MenuLeftIcon, MenuRightIcon } from "../icon";
import { joinClassNames } from "../utilities";
import { NavCloseBtn, NavMinBtn, NavOpenBtn, NavSizeAutoButton, NavVisBtn } from "./client-components";
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
          <NavVisBtn><MenuRightIcon /></NavVisBtn>
          <NavSizeAutoButton />
          <NavCloseBtn><CrossIcon /></NavCloseBtn>
          <NavMinBtn><MenuLeftIcon /></NavMinBtn>
        </div>
        <div className="nav">
          <div className={joinClassNames("nav-contents", props.navClassName)}>
            {props.children}
          </div>
        </div>
      </nav>
      <header className="header-wrap">
        <div className="nav-btn-wrap nav-open">
          <NavOpenBtn><MenuIcon /></NavOpenBtn>
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
