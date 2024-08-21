import Link from "@/react/elements/link";
import { ReactNode } from "react";
import css from "../../styles.module.scss";
import { InputsAsClient } from "../inputs-client";
import { InputsAsServer } from "../inputs-server";
import { PageTransitionProvider } from "../provider";

const Layout = (props: { children: ReactNode }) => {
  // eslint-disable-next-line no-console
  console.log("ssr render");
  return (
    <>
      <Link href="/sandbox/page-transition/ssr">
        <h3>SSR</h3>
      </Link>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      <PageTransitionProvider
        params={{ params: "ssr" }}
      >
        {props.children}
      </PageTransitionProvider>
    </>
  );
};

export default Layout;
