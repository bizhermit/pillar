import { InputsAsClient } from "../../../../inputs-client";
import { InputsAsServer } from "../../../../inputs-server";
import css from "../../../../styles.module.scss";
import { Links } from "../links";

type Params = {
  id?: Array<string>;
};

const Page = (props: { params: Params; }) => {
  // eslint-disable-next-line no-console
  console.log("page", props.params);
  return (
    <>
      <h3>page</h3>
      <span>{JSON.stringify(props.params)}</span>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      <Links />
    </>
  );
};

export default Page;
