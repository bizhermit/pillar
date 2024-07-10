/* eslint-disable no-console */
"use client";

import { Button, ButtonIcon } from "@/react/elements/button";
import { Dialog, useDialog } from "@/react/elements/dialog";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { useFormItem } from "@/react/elements/form/hooks";
import { CheckBox } from "@/react/elements/form/items/check-box";
import { CreditCardNumberBox } from "@/react/elements/form/items/credit-card-box";
import { NumberBox } from "@/react/elements/form/items/number-box";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { SelectBox } from "@/react/elements/form/items/select-box";
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
    select: 309,
  });
  const formItem = useFormItem();

  const formDisabled = useFormItem();
  const disabled = useFormItem();
  const readOnly = useFormItem();

  const dialog = useDialog();

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
          console.log("--- submit ---", hasError);
          const fd = getFormData();
          fd.forEach((v, k) => console.log(k, v));
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
          <label>
            <span>Label:</span>
            <FormItemWrap>
              <CheckBox
                label="チェックボックス"
                name="check"
                required
                // requiredIsTrue
                disabled={disabled.value}
                readOnly={readOnly.value}
              >
                チェック
              </CheckBox>
            </FormItemWrap>
          </label>
          <FormItemWrap style={{ width: 150 }}>
            <NumberBox
              label="数値"
              name="num"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            // float={1}
            // requiredIsNotZero
            />
          </FormItemWrap>
          <FormItemWrap>
            <PasswordBox
              label="パスワード"
              name="password"
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <FormItemWrap>
            <CreditCardNumberBox
              label="クレジットカード番号"
              name="credit-card"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <FormItemWrap>
            <SelectBox
              label="セレクトボックス"
              name="select"
              required
              source={async () => {
                await sleep(3000);
                const arr = [];
                for (let i = 0; i < 100; i++) {
                  arr.push({ value: i, label: `item-${i}`});
                }
                return arr;
              }}
              // reloadSourceWhenOpen
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <select>
            <option value={1}>item 1</option>
            <option value={2}>item 2</option>
            <option value={3}>item 3</option>
          </select>
          {/* </div> */}
          <FormButton type="submit">
            submit
          </FormButton>
          <FormButton type="reset">
            reset
          </FormButton>
          <span>{formItem.value}</span>
        </div>
      </Form>
      <div className={s.row}>
        <Button
          onClick={() => {
            dialog.open();
          }}
        >
          show modal dialog
        </Button>
        <Button
          onClick={() => {
            dialog.open({ modal: false });
          }}
        >
          show modaless dialog
        </Button>
        <Dialog
          hook={dialog.hook}
          // preventBackdropClose
          // customPosition
          immediatelyMount
          keepMount
          style={{
            // width: 100,
            // height: 100,
            // top: 30,
            // left: 30,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
            }}
          >
            dialog
          </div>
          <Button
            onClick={() => {
              dialog.close();
            }}
          >
            close
          </Button>
        </Dialog>
        <span>{dialog.state}</span>
      </div>
    </div>
  );
}
