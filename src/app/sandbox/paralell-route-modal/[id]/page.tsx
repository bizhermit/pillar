import Link from "@/react/elements/link";

type Props = {
  params: Promise<{ id: string; }>;
};

const Page = async (props: Props) => {
  const params = await props.params;
  return (
    <div>
      detail: {params.id}
      <Link href="/sandbox/paralell-route-modal">return list</Link>
    </div>
  );
};

export default Page;
