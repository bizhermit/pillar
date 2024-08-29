import { InterceptingRouteLinks } from "src/app/sandbox/intercepting-routes/links";

type Props = {
  params: { id: Array<string> };
};

const Page = (props: Props) => {
  return (
    <>
      <span>@detail: {JSON.stringify(props.params.id)}</span>
      <InterceptingRouteLinks replace />
    </>
  );
};

export default Page;
