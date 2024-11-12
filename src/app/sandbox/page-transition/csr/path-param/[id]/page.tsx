"use client";

import { use } from "react";
import { InputsAsClient } from "../../../../inputs-client";
import { InputsAsServer } from "../../../../inputs-server";
import css from "../../../../styles.module.scss";
import { Links } from "../links";

type Params = {
  id: string;
};

const Page = (props: { params: Promise<Params> }) => {
  const params = use(props.params);
  // eslint-disable-next-line no-console
  console.log("page", params);
  return (
    <>
      <h3>page</h3>
      <span>{params.id}</span>
      <div className={css.inputs}>
        <InputsAsClient />
        <InputsAsServer />
      </div>
      <Links />
    </>
  );
};

export default Page;
