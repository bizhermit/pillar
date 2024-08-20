/* eslint-disable no-console */
import Link from "@/react/elements/link";
import { LinkButton } from "../../../link-button";

type Params = {
  id?: Array<string>;
}

const Page = (props: { params: Params; }) => {
  console.log(props);
  return (
    <div>
      <span>{JSON.stringify(props.params)}</span>
      <ul>
        <li>
          <Link href="/sandbox">sandbox</Link>
        </li>
        <li>
          <Link href="/sandbox/page-transition/server">server</Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{}}
          >
            null
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: 4 }}
          >
            /4
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: 5 }}
          >
            /5
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: [6, 7] }}
          >
            /6/7
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: [8, 9, 10] }}
          >
            /8/9/10
          </Link>
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{}}
          />
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: 4 }}
          />
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: 5 }}
          />
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: [6, 7] }}
          />
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-params/[[...id]]"
            params={{ id: [8, 9, 10] }}
          />
        </li>
      </ul>
    </div>
  );
};

export default Page;
