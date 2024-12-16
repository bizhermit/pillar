"use client";

import { Button, type ButtonProps } from "../button";
import { useFormError } from "./hooks";

type FormButtonOptions = {
  type: "submit" | "reset";
  preventObserveError?: boolean;
};

type FormButtonProps = Omit<ButtonProps, keyof FormButtonOptions> & FormButtonOptions;

export const FormButton = ({
  preventObserveError,
  disabled,
  ...props
}: FormButtonProps) => {
  const form = useFormError();

  return (
    <Button
      {...props}
      disabled={disabled || form.disabled || form.processing || (props.type === "submit" && !preventObserveError && form.error)}
      processing={form.processing}
      outline={props.outline ?? props.type === "reset"}
    />
  );
};
