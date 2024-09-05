import Link from "@/react/elements/link";
import { Navigation } from "@/react/elements/navigation";
import { ReactNode } from "react";
import { InputsAsClient } from "./inputs-client";
import { InputsAsServer } from "./inputs-server";
import css from "./layout.module.scss";

const Layout = (props: { children: ReactNode; }) => {
  return (
    <Navigation
      header={
        <h1>
          <Link href="/sandbox" noDecoration>Sandbox</Link>
        </h1>
      }
      content={props.children}
      footer={
        <span className={css.copywrite}>
          &copy;&nbsp;2024&nbsp;bizhermit.com
        </span>
      }
    >
      <ul style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}>
        <li>
          <Link href="/sandbox/element">React Elements</Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/ssr"
          >
            Page Transition SSR
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/csr"
            params={{ id: 3 }}
          >
            Page Transition CSR
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/paralell-routes"
          >
            Parallel Routes
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/paralell-routes/hoge"
          >
            Parallel Routes / hoge
          </Link>
        </li>
        <li>
          <Link href="/sandbox/paralell-route-modal">
            Parallel Route Modal
          </Link>
        </li>
        <li>
          <Link href="/sandbox/intercepting-routes">
            Intercepting Routes
          </Link>
        </li>
        <li>
          server
          <InputsAsServer />
        </li>
        <li>
          client
          <InputsAsClient />
        </li>
      </ul>
    </Navigation>
  );
};

export default Layout;
