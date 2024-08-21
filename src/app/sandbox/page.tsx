import Link from "@/react/elements/link";

const Page = () => {
  return (
    <ul>
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
    </ul>
  );
};

export default Page;
