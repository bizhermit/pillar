import { InterceptingRouteLinks } from "$/sandbox/intercepting-routes/links";

type Props = {
  params: Promise<{ id: Array<string> }>;
};

const Page = async (props: Props) => {
  const params = await props.params;
  return (
    <>
      <span>@detail: {JSON.stringify(params.id)}</span>
      <InterceptingRouteLinks replace />
    </>
  );
};

export default Page;
