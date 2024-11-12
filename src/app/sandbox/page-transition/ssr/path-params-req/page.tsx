import { InputsAsClient } from "../../../inputs-client";
import { InputsAsServer } from "../../../inputs-server";
import css from "../../../styles.module.scss";
import { Links } from "./links";

type Params = {
  id: Array<string>;
};

const Page = async (props: { params: Promise<Params>; }) => {
  const params = await props.params;
  // eslint-disable-next-line no-console
  console.log("page", params);
  return (
    <>
      <h3>page (parent)</h3>
      <span>{JSON.stringify(params)}</span>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      <Links />
    </>
  );
};

export default Page;
