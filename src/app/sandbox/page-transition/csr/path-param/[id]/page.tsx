"use client";

import css from "../../../../styles.module.scss";
import { InputsAsClient } from "../../../inputs-client";
import { InputsAsServer } from "../../../inputs-server";
import { Links } from "../links";

type Params = {
  id: string;
};

const Page = (props: { params: Params }) => {
  // eslint-disable-next-line no-console
  console.log("page", props.params);
  return (
    <>
      <h3>page</h3>
      <span>{props.params.id}</span>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      <Links />
    </>
  );
};

export default Page;
