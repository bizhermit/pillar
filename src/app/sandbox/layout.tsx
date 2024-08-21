import Link from "@/react/elements/link";
import { ReactNode } from "react";
import css from "./styles.module.scss";

const Layout = (props: { children: ReactNode; }) => {
  return (
    <>
      <Link href="/sandbox" noDecoration>
        <h1>
          SandBox
        </h1>
      </Link>
      <div className={css.wrap}>
        {props.children}
      </div>
    </>
  );
};

export default Layout;
