"use client";

import { Button } from "@/react/elements/button";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { TextBox } from "@/react/elements/form/items/text-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
import { useState } from "react";
import css from "./styles.module.scss";

export const InputsAsClient = () => {
  const [count, setCount] = useState(0);

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
    </div>
  );
};
