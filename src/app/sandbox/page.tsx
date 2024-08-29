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
    </ul>
  );
};

export default Page;
