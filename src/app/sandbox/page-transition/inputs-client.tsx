"use client";

import { Button } from "@/react/elements/button";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { TextBox } from "@/react/elements/form/items/text-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
import { use, useState } from "react";
import css from "../styles.module.scss";
import { PageTransitionContext } from "./provider";

export const InputsAsClient = () => {
  const [count, setCount] = useState(0);
  const ctx = use(PageTransitionContext);

  return (
    <div className={css.inputs}>
      <ToggleSwitch />
      <Form
        className={css.form}
        onSubmit={({ getBindData }) => {
          // eslint-disable-next-line no-console
          console.log(getBindData({}));
        }}
      >
        <TextBox name="text" />
        <FormButton type="submit">submit</FormButton>
      </Form>
      <Button onClick={() => setCount(c => c + 1)}>{count}</Button>
      <span>{JSON.stringify(ctx.params)}</span>
    </div>
  );
};
