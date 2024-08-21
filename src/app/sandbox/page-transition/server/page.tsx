import Link from "@/react/elements/link";

const Page = () => {
  return (
    <ul>
      <li>
        <Link
          href="/sandbox/page-transition/server/path-param/[id]"
          params={{ id: 3 }}
        // disabled
        >
          path-param
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/server/path-params-req/[...id]"
          params={{ id: 3 }}
        >
          path-params-req
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/server/path-params/[[...id]]"
          params={{ id: 3 }}
        >
          path-params
        </Link>
      </li>
    </ul>
  );
};

export default Page;
