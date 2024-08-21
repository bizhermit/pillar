import Link from "@/react/elements/link";
import { PageTransLinkButton } from "../../../link-button";

export const Links = () => {
  return (
    <ul>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{}}
        >
          null
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: 4 }}
        >
          /4
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: 5 }}
        >
          /5
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: [6, 7] }}
        >
          /6/7
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: [8, 9, 10] }}
        >
          /8/9/10
        </Link>
      </li>
      <li>
        <PageTransLinkButton
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{}}
        />
      </li>
      <li>
        <PageTransLinkButton
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: 4 }}
        />
      </li>
      <li>
        <PageTransLinkButton
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: 5 }}
        />
      </li>
      <li>
        <PageTransLinkButton
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: [6, 7] }}
        />
      </li>
      <li>
        <PageTransLinkButton
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: [8, 9, 10] }}
        />
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-param/[id]"
          params={{ id: 0 }}
        >
          path param
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-params-req/[...id]"
          params={{ id: 1 }}
        >
          path params req
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/csr/path-params/[[...id]]"
          params={{ id: 2 }}
        >
          path params
        </Link>
      </li>
    </ul>
  );
};
