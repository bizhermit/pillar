"use client";

import Link from "@/react/elements/link";
import { ReactNode } from "react";
import css from "../../styles.module.scss";
import { InputsAsClient } from "../inputs-client";
import { InputsAsServer } from "../inputs-server";

const Layout = (props: { children: ReactNode}) => {
  return (
    <>
      <Link href="/sandbox/page-transition/client">
        <h3>CSR</h3>
      </Link>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      {props.children}
    </>
  );
};

export default Layout;
