import Link from "@/react/elements/link";

type Props = {
  params: { id: string; };
};

const Page = (props: Props) => {
  return (
    <div>
      detail: {props.params.id}
      <Link href="/sandbox/paralell-route-modal">return list</Link>
    </div>
  );
};

export default Page;
