import { type ReactNode } from "react";

type NavigationProps = {
  header: ReactNode;
  footer?: ReactNode;
  content: ReactNode;
  children: ReactNode;
};

export const Navigation = (props: NavigationProps) => {
  return (
    <div className="nav-wrap">
      <header className="header">
        {props.header}
      </header>
      <main className="main">
        {props.content}
      </main>
      {props.footer &&
        <footer className="footer">
          {props.footer}
        </footer>
      }
      <nav className="nav">
        {props.children}
      </nav>
    </div>
  );
};
