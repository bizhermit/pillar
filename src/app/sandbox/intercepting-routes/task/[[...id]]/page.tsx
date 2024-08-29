import { InterceptingRouteLinks } from "../../links";

type Props = {
  params: { id: Array<string> };
};

const Page = (props: Props) => {
  const isNew = props.params.id == null;

  return (
    <>
      <span>task: {isNew ? "add" : JSON.stringify(props.params.id[0])}</span>
      <InterceptingRouteLinks />
    </>
  );
};

export default Page;
