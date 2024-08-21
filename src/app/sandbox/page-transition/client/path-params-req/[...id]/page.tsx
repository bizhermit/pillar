"use client";

import Link from "@/react/elements/link";
import css from "../../../../styles.module.scss";
import { InputsAsClient } from "../../../inputs-client";
import { InputsAsServer } from "../../../inputs-server";
import { PageTransLinkButton } from "../../../link-button";

type Params = {
  id: Array<string>;
}

const Page = (props: { params: Params; }) => {
  // eslint-disable-next-line no-console
  console.log("layout", props.params);
  return (
    <>
      <h3>page</h3>
      <span>{JSON.stringify(props.params)}</span>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      <ul>
        <li>
          <Link
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{}}
          >
            null
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: 4 }}
          >
            /4
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: 5 }}
          >
            /5
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: [6, 7] }}
          >
            /6/7
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: [8, 9, 10] }}
          >
            /8/9/10
          </Link>
        </li>
        <li>
          <PageTransLinkButton
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{}}
          />
        </li>
        <li>
          <PageTransLinkButton
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: 4 }}
          />
        </li>
        <li>
          <PageTransLinkButton
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: 5 }}
          />
        </li>
        <li>
          <PageTransLinkButton
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: [6, 7] }}
          />
        </li>
        <li>
          <PageTransLinkButton
            href="/sandbox/page-transition/client/path-params-req/[...id]"
            params={{ id: [8, 9, 10] }}
          />
        </li>
      </ul>
    </>
  );
};

export default Page;
