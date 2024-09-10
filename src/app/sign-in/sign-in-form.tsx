"use client";

import { authErrorCallbackUrlQueryName, signIn_email, signIn_password } from "@/auth/consts";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { useFormItem } from "@/react/elements/form/hooks";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { TextBox } from "@/react/elements/form/items/text-box";
import { useMessageBox } from "@/react/elements/message-box";
import useRouter from "@/react/hooks/router";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import css from "./page.module.scss";

type Props = {
  redirectUrl: PagePath;
};

export const SignInForm = (props: Props) => {
  const msgBox = useMessageBox();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useFormItem();

  return (
    <div className={css.wrap}>
      <Form
        className={css.form}
        onSubmit={async ({ getBindData, keepLock }) => {
          try {
            const res = await signIn("credentials", {
              ...getBindData(),
              redirect: false,
            });
            if (res == null || !res.ok || res.error) {
              throw new Error();
            }
            keepLock();
            const callbackUrl = searchParams.get(authErrorCallbackUrlQueryName);
            if (callbackUrl) {
              router.replace(((Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl) as PagePath) || props.redirectUrl);
              return;
            }
            router.push(props.redirectUrl);
          } catch (e) {
            msgBox.alert({
              body: "SignIn Error",
              color: "danger",
            }).finally(() => {
              email.focus();
            });
          }
        }}
      >
        <TextBox
          className={css.input}
          dataItem={signIn_email}
          placeholder={signIn_email.label}
          hideMessage
          hook={email.hook}
          autoFocus
        />
        <PasswordBox
          className={css.input}
          dataItem={signIn_password}
          placeholder={signIn_password.label}
          hideMessage
        />
        <FormButton type="submit">
          SignIn
        </FormButton>
      </Form>
    </div>
  );
};