"use client";

import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { TextBox } from "@/react/elements/form/items/text-box";
import { FormItemWrap } from "@/react/elements/form/wrap";
import { LoadingBar } from "@/react/elements/loading";
import { useMessageBox } from "@/react/elements/message-box";
import useRouter from "@/react/hooks/router";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import css from "./page.module.scss";

type Props = {
  searchParams: {
    callbackUrl?: string | string[];
  };
};

const Page = ({ searchParams }: Props) => {
  const msgBox = useMessageBox();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.replace("/user");
    }
  }, []);

  if (session.status !== "unauthenticated") {
    return <LoadingBar />;
  }
  return (
    <div className={css.wrap}>
      <Form
        className={css.form}
        onSubmit={async ({ getBindData, keepLock }) => {
          const res = await signIn("credentials", {
            ...getBindData(),
            redirect: false,
          });
          if (res == null || !res.ok) {
            msgBox.alert({
              title: "SignIn Error",
              body: res?.error ? JSON.parse(res.error) : null,
            });
            return;
          }
          keepLock();
          const callbackUrl = searchParams.callbackUrl;
          if (callbackUrl) {
            router.replace(((Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl) as PagePath) || "/user");
            return;
          }
          router.push("/user");
        }}
      >
        <FormItemWrap>
          <TextBox
            className={css.input}
            name="email"
            inputMode="email"
          />
        </FormItemWrap>
        <FormItemWrap>
          <PasswordBox
            className={css.input}
            name="password"
          />
        </FormItemWrap>
        <FormButton type="submit">
          SignIn
        </FormButton>
      </Form>
    </div>
  );
};

export default Page;
