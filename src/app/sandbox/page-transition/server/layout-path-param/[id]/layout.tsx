/* eslint-disable no-console */
import Link from "@/react/elements/link";
import { LinkButton } from "../../../link-button";

type Params = {
  id: string;
};

const Page = (props: { params: Params }) => {
  console.log(props);
  return (
    <div>
      <span>{props.params.id}</span>
      <ul>
        <li>
          <Link href="/sandbox">sandbox</Link>
        </li>
        <li>
          <Link href="/sandbox/page-transition/server">server</Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-param/[id]"
            params={{}}
          >
            null
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-param/[id]"
            params={{ id: 4 }}
          >
            /4
          </Link>
        </li>
        <li>
          <Link
            href="/sandbox/page-transition/server/layout-path-param/[id]"
            params={{ id: 5 }}
          >
            /5
          </Link>
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-param/[id]"
            params={{}}
          />
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-param/[id]"
            params={{ id: 4 }}
          />
        </li>
        <li>
          <LinkButton
            href="/sandbox/page-transition/server/layout-path-param/[id]"
            params={{ id: 5 }}
          />
        </li>
      </ul>
    </div>
  );
};

export default Page;
