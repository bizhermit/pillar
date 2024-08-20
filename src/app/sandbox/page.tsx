import Link from "@/react/elements/link";

const Page = () => {
  return (
    <ul>
      <li>
        <Link href="/sandbox/element">react element</Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/server"
        >
          server page-transition
        </Link>
      </li>
      <li>
        <Link
          href="/sandbox/page-transition/client"
          params={{ id: 3 }}
        >
          client page-transition
        </Link>
      </li>
    </ul>
  );
};

export default Page;
