/* eslint-disable no-console */
"use client";

import { Button, ButtonIcon } from "@/react/elements/button";
import { Form } from "@/react/elements/form";
import { useFormItem } from "@/react/elements/form/hooks";
import { TextBox } from "@/react/elements/form/items/text-box";
import { FormItemWrap } from "@/react/elements/form/wrap";
import { sleep } from "@/utilities/sleep";
import { useRef, useState } from "react";
import s from "./page.module.css";

export default function Home() {
  const ref = useRef<HTMLButtonElement>(null);
  const [bind, setBind] = useState({
    text: "123",
  });
  const formItem = useFormItem();

  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  return (
    <div>
      <div className={s.row}>
        root page

        <button disabled>button</button>
        <button>ボタン</button>
        <a
          // href="https://bizhermit.com"
          aria-disabled
          target="_blank"
        >
          リンク
        </a>
        <a
          href="https://bizhermit.com"
          role="button"
          target="_blank"
          aria-disabled
        >
          リンク
        </a>
        <Button
          ref={ref}
          onClick={() => {
            console.log(ref.current);
          }}
        >
          Reactボタン
        </Button>
        <Button
          onClick={async ({ unlock }) => {
            console.log(bind);
            await sleep(3000);
            unlock();
          }}
        >
          <ButtonIcon>a</ButtonIcon>
        </Button>
        <Button
          onClick={() => {
            setDisabled(c => !c);
          }}
        >
          disabled: {String(disabled)}
        </Button>
        <Button
          onClick={() => {
            setReadOnly(c => !c);
          }}
        >
          readOnly: {String(readOnly)}
        </Button>
        <Button
          onClick={() => {
            formItem.setValue("hogehoge");
          }}
        >
          set hogehoge
        </Button>
      </div>
      <Form
        bind={bind}
        onSubmit={async () => {
          await sleep(3000);
        }}
      >
        <div className={s.row}>
          {/* <div style={{ width: 150 }}> */}
          <FormItemWrap
            // style={{ width: 100 }}
          >
            <TextBox
              // style={{ width: "100px" }}
              placeholder="テキスト"
              name="text"
              label="テキスト"
              defaultValue="hoge"
              required
              disabled={disabled}
              readOnly={readOnly}
              hook={formItem.hook}
            />
          </FormItemWrap>
          {/* </div> */}
          <button type="submit">submit</button>
          <span>{formItem.value}</span>
        </div>
      </Form>
      {/* <div className={s.row}>
        <TextBox />
      </div> */}
    </div>
  );
}
