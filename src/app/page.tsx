/* eslint-disable no-console */
"use client";

import { Button, ButtonIcon } from "@/react/elements/button";
import { Form } from "@/react/elements/form";
import { useFormItem } from "@/react/elements/form/hooks";
import { TextBox } from "@/react/elements/form/items/text-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
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

  const formDisabled = useFormItem();
  const disabled = useFormItem();
  const readOnly = useFormItem();

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
          console
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
        <ToggleSwitch
          hook={formDisabled.hook}
        >
          form disabled
        </ToggleSwitch>
        <ToggleSwitch
          hook={disabled.hook}
        >
          item disabled
        </ToggleSwitch>
        <ToggleSwitch
          hook={readOnly.hook}
        >
          item readonly
        </ToggleSwitch>
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
        disabled={formDisabled.value}
        onSubmit={async ({ hasError, getFormData }) => {
          // await sleep(3000);
          console.log("--- submit ---", hasError);
          const fd = getFormData();
          fd.forEach((v, k) => console.log(k, v));
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
              disabled={disabled.value}
              readOnly={readOnly.value}
              hook={formItem.hook}
            />
          </FormItemWrap>
          <label>
            <span>Label:</span>
            <FormItemWrap>
              <ToggleSwitch
                label="トグル"
                name="toggle"
                required
                requiredIsTrue
                disabled={disabled.value}
                readOnly={readOnly.value}
              >
                トグル
              </ToggleSwitch>
            </FormItemWrap>
          </label>
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
