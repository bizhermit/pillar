import Link from "@/react/elements/link";

const Page = () => {
  return (
    <div>
      <span>@list</span>
      <ul>
        <li>
          <Link href="/sandbox/paralell-route-modal/[id]" params={{ id: 1 }}>detail 1</Link>
        </li>
        <li>
          <Link href="/sandbox/paralell-route-modal/[id]" params={{ id: 2 }}>detail 2</Link>
        </li>
        <li>
          <Link href="/sandbox/paralell-route-modal/[id]" params={{ id: 3 }}>detail 3</Link>
        </li>
      </ul>
    </div>
  );
};

export default Page;
