import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { TextBox } from "@/react/elements/form/items/text-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
import css from "./styles.module.scss";

export const InputsAsServer = () => {
  return (
    <div className={css.inputs}>
      <ToggleSwitch />
      <Form className={css.form}>
        <TextBox name="text" />
        <FormButton type="submit">submit</FormButton>
      </Form>
    </div>
  );
};
