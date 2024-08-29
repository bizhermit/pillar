import { InterceptingRouteLinks } from "src/app/sandbox/intercepting-routes/links";

type Props = {
};

const Page = (_props: Props) => {
  return (
    <>
      <span>@detail: add</span>
      <InterceptingRouteLinks replace />
    </>
  );
};

export default Page;
