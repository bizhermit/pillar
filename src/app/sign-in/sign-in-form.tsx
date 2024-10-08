"use client";

import { authErrorCallbackUrlQueryName, signIn_email, signIn_password } from "@/auth/consts";
import { getDataItemLabel } from "@/data-items/label";
import { langFactory } from "@/i18n/factory";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { TextBox } from "@/react/elements/form/items/text-box";
import { $alert } from "@/react/elements/message-box";
import useRouter from "@/react/hooks/router";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import css from "./page.module.scss";

type Props = {
  redirectUrl: PagePath;
};

export const SignInForm = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = langFactory();

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
            $alert({
              body: lang("auth.authError"),
              color: "danger",
            });
          }
        }}
      >
        <TextBox
          className={css.input}
          dataItem={signIn_email}
          placeholder={getDataItemLabel({ dataItem: signIn_email, env: { lang } })}
          hideMessage
          autoFocus
        />
        <PasswordBox
          className={css.input}
          dataItem={signIn_password}
          placeholder={getDataItemLabel({ dataItem: signIn_password, env: { lang } })}
          hideMessage
        />
        <FormButton type="submit">
          {lang("auth.signInBtn")}
        </FormButton>
      </Form>
    </div>
  );
};
