"use client";

import { ReactNode } from "react";
import { InputsAsClient } from "../../../../inputs-client";
import { InputsAsServer } from "../../../../inputs-server";
import css from "../../../../styles.module.scss";
import { Links } from "../links";

type Params = {
  id: Array<string>;
};

const Page = (props: { params: Params; children: ReactNode; }) => {
  // eslint-disable-next-line no-console
  console.log("layout", props.params);
  return (
    <div className={css.layout}>
      <div>
        <h3>layout</h3>
        <span>{JSON.stringify(props.params)}</span>
        <div className={css.inputs}>
          <InputsAsClient />
          <InputsAsServer />
        </div>
        <Links/>
      </div>
      <div>
        {props.children}
      </div>
    </div>
  );
};

export default Page;
