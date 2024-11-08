"use client";

import { getDataItemLabel } from "@/data-items/label";
import { useLang } from "@/i18n/react-hook";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { TextBox } from "@/react/elements/form/items/text-box";
import { $alert } from "@/react/elements/message-box";
import useRouter from "@/react/hooks/router";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { authErrorCallbackUrlQueryName, signIn_email, signIn_password } from "~/auth/consts";
import css from "./page.module.scss";

type Props = {
  redirectUrl: PagePath;
};

export const SignInForm = (props: Props) => {
  const lang = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className={css.wrap}>
      <Form
        className={css.form}
        enterSubmit
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
