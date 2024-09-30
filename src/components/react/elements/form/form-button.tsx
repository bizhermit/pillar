"use client";

import { use } from "react";
import { FormContext } from ".";
import { Button, type ButtonProps } from "../button";

type FormButtonOptions = { type: "submit" | "reset" };

type FormButtonProps = Omit<ButtonProps, keyof FormButtonOptions> & FormButtonOptions;

export const FormButton = ({
  disabled,
  ...props
}: FormButtonProps) => {
  const form = use(FormContext);

  return (
    <Button
      {...props}
      disabled={disabled || form.disabled || form.processing || form.hasError()}
      processing={form.processing}
      outline={props.outline ?? props.type === "reset"}
    />
  );
};
