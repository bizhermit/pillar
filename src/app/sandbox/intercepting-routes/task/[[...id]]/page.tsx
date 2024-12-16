import { InterceptingRouteLinks } from "../../links";

type Props = {
  params: Promise<{ id: Array<string> }>;
};

const Page = async (props: Props) => {
  const params = await props.params;
  const isNew = params.id == null;

  return (
    <>
      <span>task: {isNew ? "add" : JSON.stringify(params.id[0])}</span>
      <InterceptingRouteLinks />
    </>
  );
};

export default Page;
